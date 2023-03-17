
// TODO: Make logging Optionala usong variable LOG_MESSAGES

import {execSync} from 'child_process'
import {accessSync, readFileSync, existsSync} from 'fs';
import colors from 'colors';
import {error, log} from 'console';


/**
 * An object containing properties for things to check.
 * @typedef {Object} THINGS_TO_CHECK
 * @property {Object.<string, boolean>} cliCommands - An object representing CLI commands to check for existence.
 * @property {Object.<string, boolean>} files - An object representing files to check for existence.
 * @property {Object} configProperties - An object representing configuration properties to check for existence.
 * @property {string} configProperties.configFileName - The name of the configuration file to check.
 * @property {boolean} configProperties.configFileExists - Stores whether comfig file exists or not
 * @property {Object.<string, boolean>} configProperties.configPropertyNames - An object representing the names of the configuration properties to check for existence.
 * @property {Object.<string, boolean>} configProperties.configPropertyChecks - An object representing the checks to perform on the configuration properties.
 */

/**
 * An object representing the THINGS_TO_CHECK.
 * @type {THINGS_TO_CHECK}
 */
const THINGS_TO_CHECK = {
  cliCommands: {
		"adb": false,
		"zip": false,
  
  },
  files: {
    "termux-aarch64.apk": false,
    "bootScript.sh": false,
  },
  configProperties: {
    configFileName: "bootConfig.json",
    configFileExists: false,
    configPropertyNames: {
			"wifiName": false,
			"wifiPassword": false,
    },
    configPropertyChecks: {
      "wifi does not have white space": false,
    }
  }
};

// function whose curly braces is not closed ? 
//
/**
 * Represents the status of the environment check.
 * @type {boolean}
 * @description If any of the environment checks come back false, this will be set to false as well.
 */
let ENVIROMENT_STATUS_PERFECT = true;

/**
* check if file exists in thevgiven file path
* @function
* @param {string} filePath
* @return {boolean}
*/
const fileExists = (filePath) => {
  
  if (existsSync(filePath))
    return true;
  return false;
};

/**
 * Logs the givem strimg as bold
 * @param {string} logMessage
 * @returns {void}
 */
const logBold = (logMessage) => {
  log(logMessage.bold);
};
/**
* checks if a cli is available in linux
* @function
* @param {string} cliCommandName
*/
const  checkCliCommand = (cliCommamdName) => {
  try {
    execSync(`command -v ${cliCommamdName}`); // executes successfilly if the cli command exists
    return true;
  } catch (error) {
    return false;
  }
};

const  checkFileExists = (filename) => {
  try {
    accessSync(filename);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Checks if an object has a certain property.
 *
 * @param {object} obj - The object to check.
 * @param {string} propName - The name of the property to check.
 * @returns {boolean} True if the object has the property, false otherwise.
 */
 const hasProperty = (obj, propName) => {

  return Object.prototype.hasOwnProperty.call(obj, propName);
};


/**
 * Reads a JSON file and parses the contents into a JavaScript object.
 *
 * @param {string} filename - The name of the file to read.
 * @returns {object|null} The parsed JavaScript object or null if an error occurred.
 */
 const readJsonFile = (filename) => {
  try {
     let data = readFileSync(filename, 'utf8');
     let jsonData = JSON.parse(data);
    return jsonData;
  } catch (error) {
    console.error(`Error reading JSON file: ${error}`);
    return null;
  }
};

/**
 * Checks the environment by verifying the existence of CLI commands, files, and properties.
 *
 * @param {object} env - The environment to check as an object with `cliCommands`, `files`, and `configProperties` properties.
 * @returns {object} The updated environment object with the `cliCommands`, `files`, and `configProperties` properties set to `true` or `false` depending on their existence.
 */
const checkEnvironment = (env) => {
  const { cliCommands, files, configProperties } = env;

  // Check CLI commands
  for (const commandName in cliCommands) {
    cliCommands[commandName] = checkCliCommand(commandName);
  }

  // Check files
  for (const fileName in files) {
    files[fileName] = checkFileExists(fileName);
  }

  // Check config properties
  const configFilePath = configProperties.configFileName;
  const configExists = checkFileExists(configFilePath);
  configProperties.configFileExists = configExists;

  if (configExists) {
    const config = readJsonFile(configFilePath);

    if (config !== null) {
      const configPropNames = configProperties.configPropertyNames;
      const configPropChecks = configProperties.configPropertyChecks;
      for (const propName in configPropNames) {
        configPropNames[propName] = hasProperty(config, propName);
      }
        // Check for white space in wifi name
      for (const checkName in configPropChecks) {
        if (checkName === 'wifiNameDoesNotHaveWhiteSpace') {
          configPropChecks[checkName] = !config.wifiName.includes(' ');
          log(config.wifiName.includes(' '));
          log(configPropChecks);
        }
      }
    }
  }

  return env;
};


// Helper function to log the status of each item
const logItemStatus= (itemName, itemStatus) => {
  const statusMessage = itemStatus ? `[✓] ${itemName}`.green : `[X] ${itemName}`.red;
  if(ENVIROMENT_STATUS_PERFECT)
    ENVIROMENT_STATUS_PERFECT = itemStatus ? true : false;
  log(statusMessage);
};


// Log the status of cliCommands
/**
 * Colored enviroment status output
 *
 * @param {THINGS_TO_CHECK} enviromentStatusObject
 * @returns {void}
 */
const logEnviromentStatus = (enviromentStatusObject) => {
  // Function body

  log('cli-commamds: If cli is not present, please add them to path'.bold);
  for (const cliCommand in enviromentStatusObject.cliCommands) {
    logItemStatus(cliCommand, enviromentStatusObject.cliCommands[cliCommand]);
  }

  // Log the status of files
  logBold('\nfiles: In case of error please add these files');
  for (const file in enviromentStatusObject.files) {
    logItemStatus(file, enviromentStatusObject.files[file]);
  }

  /**
   * Stores config file name
   * @type {string}
   */
  let configFile = enviromentStatusObject.configProperties.configFileName;
  logBold("\nConfig File");
  logItemStatus(`${configFile}`, enviromentStatusObject.configProperties.configFileExists); // Config file
  // Log the status of configProperties
  logBold(('\nConfig File Properties: In case of error please fill those properties in: ' +  configFile.yellow));
  for (const configProperty in enviromentStatusObject.configProperties.configPropertyNames) {
    logItemStatus(configProperty, enviromentStatusObject.configProperties.configPropertyNames[configProperty]);

  }

  // Log the status of configPropertChecks
  logBold(('\nConfig File Property Checks: In case of error please fix those properties in: ' +  configFile.yellow));
  for (const configPropertyCheck in enviromentStatusObject.configProperties.configPropertyChecks) {
    logItemStatus(configPropertyCheck, enviromentStatusObject.configProperties.configPropertyChecks[configPropertyCheck]);
};
};

// function to check if string has white spaces
const hasWhiteSpace = (s) => {
  return /\s/g.test(s);
}

/**
 * Performs enviroment check, log check status
 *
 * @returns {boolean} isEnviromentPerfect
 */
export const performEnviromentCheck = () => {
  let enviromentStatusObject = checkEnvironment(THINGS_TO_CHECK);
  logEnviromentStatus(enviromentStatusObject);
  if(ENVIROMENT_STATUS_PERFECT)
    return
  // log error if wifi name has white spaces
  error("\nPlease fix the above errors for the cli to run".red.bold);
  process.exit(1);
};
