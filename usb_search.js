const { exec } = require("child_process");
// Function to check if a device has a serial number
function executePowerShellCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing PowerShell command: ${error}`);
        reject(error);
      }
      if (stderr) {
        console.error(`PowerShell stderr: ${stderr}`);
      }
      resolve(stdout);
    });
  });
}

// Function to search for serial number in PowerShell output
function searchSerialNumber(output, serialNumber) {
  // Split the output into lines
  const lines = output.split("\n");
  // Search for the serial number in each line
  for (const line of lines) {
    if (line.includes(serialNumber)) {
      return true; // Serial number found
    }
  }
  return false; // Serial number not found
}

// Example usage
const serialNumberToSearch = "00187D1174FBED71F000B633";

const command = "wmic path Win32_USBControllerDevice get Dependent";
executePowerShellCommand(command)
  .then((output) => {
    // Search for serial number in output
    const found = searchSerialNumber(output, serialNumberToSearch);
    if (found) {
      console.log("USB flash drive found!");
    } else {
      console.log("USB flash drive not found.");
    }
  })
  .catch((error) => {
    console.error("Error executing PowerShell command:", error);
  });

module.exports = { executePowerShellCommand, searchSerialNumber };
