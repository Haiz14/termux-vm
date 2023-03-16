#!/bin/node


// api request


import {performEnviromentCheck} from './check.js'
import {runVM} from './runVM.js';

// Enviroment check exists the process if the enviroment doesnt have necessary stuff
performEnviromentCheck();
runVM();




