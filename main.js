/**
 * Created by ed on 24.04.17.
 */

'use strict';

const electron = require('electron');
const {app, BrowserWindow} = electron;
const path = require('path');
const url = require('url');

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
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
