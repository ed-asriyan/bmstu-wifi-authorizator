/**
 * Created by ed on 24.04.17.
 */

'use strict';

const electron = require('electron');
const {app, BrowserWindow} = electron;
const path = require('path');
const url = require('url');

global.argv = process.argv;

app.on('ready', () => {
    let mainWindow = new BrowserWindow({
        width: 350,
        height: 235,
        resizable: false,
        center: true,
        webSecurity: false,
    });
    mainWindow.setMenu(null);
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    let handleRedirect = (e, url) => {
        if (url !== mainWindow.webContents.getURL()) {
            e.preventDefault();
            require('electron').shell.openExternal(url);
        }
    };
    mainWindow.webContents.on('will-navigate', handleRedirect);
    mainWindow.webContents.on('new-window', handleRedirect);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
