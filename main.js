// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const path = require('path')

const url = require('url')
const portn = Math.floor(Math.random() * 100) + 9001;
const port = portn.toString()
const child = require('child_process');
const MACOS = "darwin"
const WINDOWS = "win32"

var killStr = ""
var appPath = path.join(app.getAppPath(), "app.R" )
var execPath = "RScript"

if(process.platform == WINDOWS){
  killStr = "taskkill /im Rscript.exe /f"
  appPath = appPath.replace(/\\/g, "\\\\");
  execPath = path.join(app.getAppPath(), "R-Portable", "App", "R-Portable", "bin", "RScript.exe" )
} else {
  console.log("not on windows?")
  throw new Error("not on windows?")
}

//console.log(process.env)

const childProcess = child.spawn(execPath, ["-e", "shiny::runApp(file.path('"+appPath+"'), port="+port+")"])
childProcess.stdout.on('data', (data) => {
  console.log(`stdout:${data}`)
})
childProcess.stderr.on('data', (data) => {
  console.log(`stderr:${data}`)
})

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow


function createWindow () {
	
	
   const loading = new BrowserWindow({show: false, frame: false})
 
   loading.loadURL(path.join(__dirname, 'loader.html') );
 

   loading.once('show', () => {


  // Create the browser window.
  mainWindow = new BrowserWindow({
	show:false,
	title: "ShinyApp",
    width: 800,
    height: 600,
	webPreferences: {
		nodeIntegration:false,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  
  // and load the index.html of the app.
   mainWindow.loadFile('index.html') 
   
      mainWindow.webContents.once('dom-ready', () => {
        console.log(new Date().toISOString()+'::mainWindow loaded')
        setTimeout( () => {  

          mainWindow.show()
          mainWindow.reload()
          loading.hide()
          loading.close()
        }, 2000)

      })  

  mainWindow.loadURL('http://127.0.0.1:'+port)
          mainWindow.reload()


      })
    loading.show()
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}
 

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
	  
   app.quit()

  if(childProcess){
    childProcess.kill();
    if(killStr != "")
      child.execSync(killStr)
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
