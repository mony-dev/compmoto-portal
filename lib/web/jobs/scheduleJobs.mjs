import cron from 'node-cron';
import { exec } from 'child_process';

// Helper function to run a shell command
const runCommand = (command) => {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing ${command}: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Error output for ${command}: ${stderr}`);
    }
    console.log(`Output for ${command}: ${stdout}`);
  });
};

// Schedule tasks to run every midnight
cron.schedule('0 0 * * *', () => {
  console.log('Running midnight jobs');
  runCommand('npm run fetch-com-rate');
  runCommand('npm run fetch-family');
  runCommand('npm run fetch-group-type');
  runCommand('npm run fetch-product-groups');
  runCommand('npm run fetch-rims');
  runCommand('npm run fetch-sizes');
  runCommand('npm run fetch-memo');
  runCommand('npm run fetch-invoice');
  runCommand('npm run fetch-history');
  runCommand('npm run fetch-users');
  // runCommand('npm run fetch-admin')
});

// Schedule tasks to run every first day of the month at 1 AM
cron.schedule('0 1 1 * *', () => {
  console.log('Running first day of the month jobs');
  runCommand('npm run fetch-total-purchase');
  runCommand('npm run fetch-special-bonus');
});

console.log('Cron jobs scheduled');
