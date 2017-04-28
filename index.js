/**
 * Created by ed on 25.04.17.
 */

'use strict';

/**
 * Requiring
 */
const remote = require('electron').remote;
const fs = require('fs');
const Session = require('./session');
const NetworkChecker = require('./networkChecker');

const session = new Session();
const networkChecker = new NetworkChecker();

/**
 * Pages
 */
const pageLogin = document.getElementById('page_login');
const pageConnecting = document.getElementById('page_connecting');
const pageConnected = document.getElementById('page_connected');
const pageDisconnecting = document.getElementById('page_disconnecting');
const pageError = document.getElementById('page_error');

const pages = document.getElementById('pages').childNodes;

/**
 * Controls
 */
const controlLogin = document.getElementById('page_login_username_input');
const controlPassword = document.getElementById('page_login_password_input');
const controlErrorDescription = document.getElementById('page_error_description');
const controlRememberInput = document.getElementById('form_login_remember_input');
const controlAutoLoginInput = document.getElementById('page_connected_autologin_input');
const controlInternetIndicator = document.getElementById('internet_indicator');

/**
 * Manage functions
 */
const showPage = function (page) {
    pages.forEach(page => page.hidden = true);
    page.hidden = false;
};

const saveState = function () {
    let saveObj = {
        logoutId: session.logoutId,
        saveCredentials: controlRememberInput.checked,
        autoLogin: controlAutoLoginInput.checked,
    };
    if (controlRememberInput.checked) {
        saveObj.login = controlLogin.value;
        saveObj.password = controlPassword.value;
    }

    fs.writeFileSync('bmstu-wifi-authorizator.save', JSON.stringify(saveObj));
};

const loadState = function () {
    let saveObj = JSON.parse(fs.readFileSync('bmstu-wifi-authorizator.save'));

    controlLogin.value = saveObj.login || '';
    controlPassword.value = saveObj.password || '';
    controlRememberInput.checked = saveObj.saveCredentials;
    controlAutoLoginInput.checked = saveObj.autoLogin;
    if (saveObj.logoutId) {
        session.login({
            logoutId: saveObj.logoutId
        }).then(() => showPage(pageConnected));
    }
};

const updateConnectionIndicator = function () {
    if (networkChecker.isConnected) {
        controlInternetIndicator.style.color = '#28a900';
        controlInternetIndicator.title = 'Network access';
    } else {
        if (networkChecker.isChecking) {
            controlInternetIndicator.style.color = '#ccb900';
            controlInternetIndicator.title = 'Trying to connect';
        } else {
            controlInternetIndicator.style.color = '#a20c0f';
            controlInternetIndicator.title = 'No internet access';
        }
    }
};

/**
 * Routed events
 */
const onLoginClick = function () {
    showPage(pageConnecting);
    session.login({
        login: controlLogin.value,
        password: controlPassword.value,
    }).then(() => {
        showPage(pageConnected);
    }).catch(e => {
        controlErrorDescription.innerHTML = e;
        showPage(pageError);
        setTimeout(() => showPage(pageLogin), 3000);
    });
};

const onLogoutClick = function () {
    showPage(pageDisconnecting);
    session.logout().then(() => {
        showPage(pageLogin);
    }).catch(e => {
        controlErrorDescription.innerHTML = e;
        showPage(pageError);
        setTimeout(() => showPage(pageConnected), 3000);
    });
};

/**
 * Logic
 */
remote.getCurrentWindow().on('close', () => {
    saveState();
});

try {
    loadState();
} catch (e) {
}


showPage(pageLogin);

networkChecker.onConnect = updateConnectionIndicator;
networkChecker.onDisconnect = updateConnectionIndicator;
networkChecker.onCheckingBegin = updateConnectionIndicator;
networkChecker.onCheckingEnd = updateConnectionIndicator;
networkChecker.start();
