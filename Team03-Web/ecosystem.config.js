const { time } = require("console");

module.exports = {
  apps : [{
    name: 'Team03Web',
      exec_mode: 'fork',
      instances: '1', // Or a number of instances
      script: './node_modules/next/dist/bin/next',
      args: 'start', // optional, adjust as needed
      watch: true, // optional, adjust as needed
      max_memory_restart: '1000M', // optional, adjust as needed
      error_file : "../config-error.log",
      out_file : "../config-out.log",
      time: true
  }
  ],
};