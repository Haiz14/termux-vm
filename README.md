# vm-nodejs

use andrroid phomes as virutal machimes via adb and termux

# install
```bash
npm i -g termux-vm
```
Then just run `termux-vm`

You will get a bunch of errors, cause the cli needs certain files and info to wrok properly.

You can download a preworking enviroment to test stuff. **Ensure that adb devices ard connected**

```bash
curl -o test-env.zip -L "https://www.dropbox.com/s/c9j342a302c5py6/test-env.zip?dl=1"
unzip test-env.zip
cd test-env
termux-vm
```


