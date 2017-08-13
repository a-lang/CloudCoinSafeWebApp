const { app, BrowserWindow, dialog, Menu, Tray, globalShortcut } = require('electron')
let fs = require('fs')
const osTmpdir = require('os-tmpdir')
let mainWindow

function createWindow() {
    //var url = config.URL;
    var url = "https://www.cloudcoin.co/bank.html";
    var buttons = ['OK'];


    if (process.argv.length < 2) {
        //dialog.showMessageBox({ type: 'info', buttons: buttons, message: "Lost Configuration JSON file Parameter" }, function(buttonIndex) {
        //    app.quit();
        //});
        //return;
        var config_file = __dirname + "/config.json";
    } else {
        var config_file = process.argv[1];
    }

    //console.log(process.cwd());
    //console.log("It's located in " + __dirname);
    //console.log(config_file);

    //var config_file = process.argv[1];
    //var config_file = "./config.json";
    if (fs.existsSync(config_file) === false) {
        dialog.showMessageBox({ type: 'info', buttons: buttons, message: "Cannot found file: \n" + config_file }, function(buttonIndex) {
            app.quit();
        });
        return;
    }

    var config = JSON.parse(fs.readFileSync(config_file, 'utf-8'))

    var icon_base64 = config.icon;
    icon_base64 = icon_base64.replace(/^data:image\/png;base64,/, "");
    var icon_path = osTmpdir() + "/webapp-wrapper-icon-" + url.replace(/[^A-Za-z]/g, "") + ".png";
    fs.writeFileSync(icon_path, icon_base64, 'base64');
    config.icon = icon_path;

    mainWindow = new BrowserWindow(config);
    mainWindow.loadURL(url);
    mainWindow.on('closed', function() {
        mainWindow = null
    });


    // Tray
    appIcon = new Tray(icon_path)
    const contextMenu = Menu.buildFromTemplate([{
        label: 'Quit',
        type: 'radio',
        click: function() {
            app.quit();
        }
    }])
    contextMenu.items[(contextMenu.items.length - 1)].checked = false
    appIcon.setContextMenu(contextMenu)


    if (config.openDevTools === true) {
        mainWindow.webContents.openDevTools();
    }


    /* ------------------
        // Hotkey
        mainWindow.on('focus', function() {
            if (globalShortcut.isRegistered("Escape") === false) {
                globalShortcut.register('Escape', () => {
                    if (config.kiosk === true) {
                        return;
                    }

                    if (mainWindow.webContents.isLoading()) {
                        mainWindow.webContents.stop();
                    } else {
                        dialog.showMessageBox({
                                type: 'question',
                                buttons: ["YES", "NO"],
                                message: "Are you sure to exit?"
                            },
                            function(buttonIndex) {
                                if (buttonIndex == 0) {
                                    app.quit();
                                }
                            }
                        );
                    }

                })

                globalShortcut.register('Ctrl+Shift+i', () => {
                    mainWindow.webContents.toggleDevTools();
                })

                globalShortcut.register('Ctrl+Left', () => {
                    mainWindow.webContents.goBack();
                })

                globalShortcut.register('Ctrl+Right', () => {
                    mainWindow.webContents.goForward();
                })

                globalShortcut.register('F5', () => {
                    mainWindow.webContents.reload();
                })

                if (config.kiosk === true) {
                    // 似乎會失敗，應該要改用blur、focus的做法才是，但沒事還是不要亂做好了
                    globalShortcut.register('Alt+Tab', () => {})
                    globalShortcut.register('Ctrl+Alt+Delete', () => {})
                }
            }
            //dialog.showMessageBox({ type: 'info', buttons: buttons, message: typeof(1) });
        });


        mainWindow.on('blur', function() {
            globalShortcut.unregisterAll();
        });
    ------ */
}

app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
})

// Create default menuBar.
app.once('ready', () => {
    if (Menu.getApplicationMenu()) return

    const template = [{
            label: 'View',
            submenu: [{
                    role: 'reload'
                },
                {
                    role: 'forcereload'
                },
                {
                    role: 'toggledevtools'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'resetzoom'
                },
                {
                    role: 'zoomin'
                },
                {
                    role: 'zoomout'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'togglefullscreen'
                }
            ]
        },
        {
            role: 'window',
            submenu: [{
                    role: 'minimize'
                },
                {
                    role: 'close'
                }
            ]
        },
        {
            role: 'help',
            submenu: [{
                    label: 'Learn More',
                    click() {
                        shell.openExternal('https://electron.atom.io')
                    }
                },
                {
                    label: 'Documentation',
                    click() {
                        shell.openExternal(
                            `https://github.com/electron/electron/tree/v${process.versions.electron}/docs#readme`
                        )
                    }
                },
                {
                    label: 'Community Discussions',
                    click() {
                        shell.openExternal('https://discuss.atom.io/c/electron')
                    }
                },
                {
                    label: 'Search Issues',
                    click() {
                        shell.openExternal('https://github.com/electron/electron/issues')
                    }
                }
            ]
        }
    ]

    if (process.platform === 'darwin') {
        template.unshift({
            label: 'Electron',
            submenu: [{
                    role: 'about'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'services',
                    submenu: []
                },
                {
                    type: 'separator'
                },
                {
                    role: 'hide'
                },
                {
                    role: 'hideothers'
                },
                {
                    role: 'unhide'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'quit'
                }
            ]
        })
        template[1].submenu.push({
            type: 'separator'
        }, {
            label: 'Speech',
            submenu: [{
                    role: 'startspeaking'
                },
                {
                    role: 'stopspeaking'
                }
            ]
        })
        template[3].submenu = [{
                role: 'close'
            },
            {
                role: 'minimize'
            },
            {
                role: 'zoom'
            },
            {
                type: 'separator'
            },
            {
                role: 'front'
            }
        ]
    } else {
        template.unshift({
            label: 'File',
            submenu: [{
                role: 'quit'
            }]
        })
    }

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
})