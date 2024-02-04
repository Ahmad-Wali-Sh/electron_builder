const { app, BrowserWindow, dialog } = require("electron");
const { spawn } = require("child_process");
const serve = require("electron-serve");
const path = require("path");
const {
  executePowerShellCommand,
  searchSerialNumber,
} = require("./usb_search");
const { usb } = require("usb");

let mainWindow;
let backendProcess;

const loadURL = serve({ directory: path.join(__dirname, "frontend") });
app.on("ready", () => {
  // Check if the allowed USB device is connected

  const serialNumberToSearch = "00187D1174FBED71F000B633"; // Replace with your serial number

  // Execute PowerShell command to list USB devices
  const command = "wmic path Win32_USBControllerDevice get Dependent";
  executePowerShellCommand(command)
    .then((output) => {
      // Search for serial number in output
      const found = searchSerialNumber(output, serialNumberToSearch);
      if (found) {
        mainWindow = new BrowserWindow({
          width: 1000,
          height: 900,
        });

        loadURL(mainWindow);

        if (process.env.NODE_ENV === "development") {
          backendProcess = spawn(
            path.join(__dirname, "run_server/run_server.exe")
          );
        } else {
          backendProcess = spawn(
            path.join(process.resourcesPath, "run_server/run_server.exe")
          );
        }

        usb.on("detach", function (device) {
          executePowerShellCommand(command).then((output) => {
            const found = searchSerialNumber(output, serialNumberToSearch);
            if (!found) {
              mainWindow.close();
            }
          });
        });

        mainWindow.on("closed", () => {
          mainWindow = null;
          backendProcess.kill();
          backendProcess = null;
        });
      } else {
        console.log("USB flash drive not found.");
        dialog.showErrorBox("Error", "لطفا فلش خریداری شده را وارد کنید");
        throw new Error("This is a test error");
      }
    })
    .catch((error) => {
      console.error("Error executing PowerShell command:", error);
    });
});
