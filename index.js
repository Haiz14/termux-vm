#!/bin/node


// api request
import {readFileSync} from 'fs';

import {performEnviromentCheck} from './check.js'
import {runVM} from './runVM.js';

// Enviroment check exists the process if the enviroment doesnt have necessary stuff
performEnviromentCheck();

const bootConfig = JSON.parse(
  readFileSync('./bootConfig.json', 'utf8')
);
runVM(bootConfig);




