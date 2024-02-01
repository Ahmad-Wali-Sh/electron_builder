const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const serve = require("electron-serve");
const path = require("path");
const usb = require("usb");
const HID = require("node-hid");

let mainWindow;
let backendProcess;
const ALLOWED_VID = 0x0930;
const ALLOWED_PID = 0x6545;

const loadURL = serve({ directory: path.join(__dirname, "frontend") });
app.on("ready", () => {
  // Check if the allowed USB device is connected
  checkAllowedDevice();
});

// Function to check if the allowed USB device is connected
function checkAllowedDevice() {
  const devices = usb.getDeviceList();
  for (const device of devices) {
    console.log(device);
    const deviceDescriptor = device.deviceDescriptor;
    const serialNumber = deviceDescriptor.iSerialNumber ? device.getStringDescriptor(deviceDescriptor.iSerialNumber) : null;
    if (
      deviceDescriptor.idVendor === ALLOWED_VID &&
      deviceDescriptor.idProduct === ALLOWED_PID
    ) {
      console.log("Allowed USB device found:", deviceDescriptor, "Serial Number:", serialNumber);
      // If the allowed USB device is connected, open the application
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

      mainWindow.on("closed", () => {
        mainWindow = null;
        backendProcess.kill();
        backendProcess = null;
      });
      // Other initialization code...
      return;
    }
  }

  // If the allowed USB device is not connected, display an error message and quit
  console.error("Allowed USB device not found.");
  app.quit();
  throw new Error("لطفا فلش خریداری شده را وارد کنید.");
}