// get devices ne via adb
// imstall ./termux-aarch64.apk on every devices
// set wifi on all devices
// move curremt directory wxecpt termux.apk to the debian root folder
//
// execute boot.sh on all devices


import {promisify} from 'util'
import { exec, execSync } from 'child_process';
import {log} from 'console';
import colors from 'colors';

const promiseExec = promisify(exec);




const returnDevicesFromAdbOutput = (adbOutput) => {
   return adbOutput
    .filter(line => line.split('\t').length == 2) // remove all lines except the ones with deviceId and deviceName
    .map(deviceAndDeviceName => {
      return deviceAndDeviceName
        .split('\t')[0]; //  split sentence into words
    });

}


const removeNonAarch64Devices = (devicesArray) => {
  return devicesArray.filter((device) => {
    return (execSync(`adb -s ${device} shell uname -m`).toString() === 'aarch64');
  });
};

const isTermuxInstalled = (deviceId) =>  {
  let  termuxInstalled = false;
    const output = execSync(`adb -s ${deviceId} shell pm list packages com.termux`).toString()
      .split('\n');
    // split output onto array of lines
    // check if output has "package:com.termux"
    output.forEach((line) => {
      if(line===`package:com.termux`)
         termuxInstalled = true;
    });
  return termuxInstalled;
}
const installTermux = async (devicesArray) => {
  const installPromises = devicesArray.map(async (device) => {
    // if termux is installed returm resolved promise else install termux
    if (isTermuxInstalled(device)) {
      return Promise.resolve();
    }
    else {
    await  (promisify(exec)(`adb -s ${device} install termux-aarch64.apk`));
    exec(`adb -s ${device} shell am start -n com.termux/.app.TermuxActivity`)
    // return a promise that resolves after 10 seconds
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 30000);
    })
    }
  });

  return Promise.all(installPromises);
};

// TOTEST: This function is not tested yet
const connectToWifi = async (devicesArray, wifiName, wifiPassword ) => {
  
  const wifiPromises = devicesArray.map(async (device) => {
    return promiseExec(`adb -s ${device} shell cmd -w wifi connect-network ${wifiName} wpa2 ${wifiPassword}`);
  });
    return Promise.all(wifiPromises);
}

const runBootScript = async (devicesArray) => {
  // move boot.sh to /sdcard/ on phone
  // grant termux permission to access storage
  // enter command into termux to copy boot.sh to its current dire 
  // then execute that commamd
  let executionPromises = devicesArray.map(async (device) => {
    await promiseExec(`adb -s ${device} push ./bootScript.sh /sdcard/ `);
    await promiseExec(`adb -s ${device} shell pm grant com.termux android.permission.READ_EXTERNAL_STORAGE `);
    // firce-stop com.termux so that permission changes take effect
    await promiseExec(`adb -s ${device} shell am force-stop com.termux`);
    // start termux
    await promiseExec(`adb -s ${device} shell am start -n com.termux/.app.TermuxActivity`);
    await promiseExec(`adb -s ${device} shell pm grant com.termux android.permission.WRITE_EXTERNAL_STORAGE `);
    await promiseExec(`adb -s ${device} shell input text "cp%s/sdcard/bootScript.sh%s./%s\\&\\&%sbash%sbootScript.sh"`);
    await promiseExec(`adb -s ${device} shell input keyevent 113`);
    return promiseExec(`adb -s ${device} shell input keyevent 66`);
    
  });
  return Promise.all(executionPromises);

}

/**
 * @function
 * @param {Object} bootConfig
 * @returns {void}
 * @description This function runs the VM on multiple devices
 */
export const runVM = async (bootConfig) => {
  log("\n------------")
  // log bootConfig for debugging
  log(bootConfig);
  log("\nRunning VM".bold)
	let adbDevicesOutput = execSync("adb devices").toString().split('\n');
  
  const devices = returnDevicesFromAdbOutput(adbDevicesOutput)
  // if devices is empty log error im bold red and exit
  if (devices.length === 0) {
    log("No devices found".bold.red);
    process.exit(1);
  }
  
  log("  [] installing termux on all devices");
  await installTermux(devices);

  log(" [] connecting to wifi");
  await connectToWifi(devices, bootConfig.wifiName, bootConfig.wifiPassword);

  log("  [] running boot-script on all devices");
  await runBootScript(devices);
  log("Script executed on all devices".green);

}

