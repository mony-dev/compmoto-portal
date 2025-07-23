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

// Schedule tasks to run every first day of the month at 1 AM
cron.schedule('0 1 1 * *', () => {
  runCommand('npm run fetch-total-purchase');
  runCommand('npm run fetch-special-bonus');
  runCommand('npm run fetch-reward-point');
});

console.log('Cron jobs scheduled');
