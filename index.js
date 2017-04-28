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
const pageAuthenticate = document.getElementById('page_authenticate');
const pageAuthentication = document.getElementById('page_authentication');
const pageAuthenticated = document.getElementById('page_authenticated');
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
    if (~remote.getGlobal('argv').indexOf('--fake-login'))return; // if (index !== -1)

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
        }).then(() => showPage(pageAuthenticated));
    }
};

const updateConnectionIndicator = function () {
    if (!networkChecker.isRunning) {
        controlInternetIndicator.style.color = '#000000';
        controlInternetIndicator.title = undefined;
    } else if (networkChecker.isConnected) {
        controlInternetIndicator.style.color = '#28a900';
        controlInternetIndicator.title = 'Network access';
    }
    else {
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
    showPage(pageAuthentication);
    networkChecker.stop();
    session.login({
        login: controlLogin.value,
        password: controlPassword.value,
    }).then(() => {
        showPage(pageAuthenticated);
    }).catch(e => {
        controlErrorDescription.innerHTML = e;
        showPage(pageError);
        setTimeout(() => showPage(pageAuthenticate), 3000);
    }).then(() => {
        setTimeout(() => {
            networkChecker.start();
        }, 2000);
    });
};

const onLogoutClick = function () {
    showPage(pageDisconnecting);
    networkChecker.stop();
    session.logout().then(() => {
        showPage(pageAuthenticate);
    }).catch(e => {
        controlErrorDescription.innerHTML = e;
        showPage(pageError);
        setTimeout(() => showPage(pageAuthenticated), 3000);
    }).then(() => {
        setTimeout(() => {
            networkChecker.start();
        }, 2000);
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


showPage(pageAuthenticate);

networkChecker.onConnect = updateConnectionIndicator;
networkChecker.onDisconnect = () => {
    updateConnectionIndicator();
    if (session.isAuthenticated && controlAutoLoginInput.checked) {
        // session.isAuthenticated = false;

        showPage(pageAuthentication);
        networkChecker.stop();
        session.login({
            login: controlLogin.value,
            password: controlPassword.value,
        }).then(() => {
            showPage(pageAuthenticated);
        }).catch(e => {
            controlErrorDescription.innerHTML = e;
            showPage(pageError);
            setTimeout(() => showPage(pageAuthenticated), 3000); // todo: create specified page
        }).then(() => {
            setTimeout(() => {
                networkChecker.start();
            }, 2000);
        });
    }
};
networkChecker.onCheckingBegin = updateConnectionIndicator;
networkChecker.onCheckingEnd = updateConnectionIndicator;
networkChecker.start();
