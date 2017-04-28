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
const pageAuthenticationLoop = document.getElementById('page_authentication_loop');
const pageAuthenticated = document.getElementById('page_authenticated');
const pageAuthenticationError = document.getElementById('page_authentication_error');
const pageDisconnecting = document.getElementById('page_disconnecting');
const pageDisconnectingError = document.getElementById('page_disconnecting_error');

const pages = document.getElementById('pages').childNodes;

/**
 * Controls
 */
const controlLogin = document.getElementById('page_login_username_input');
const controlPassword = document.getElementById('page_login_password_input');
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
    // if (~remote.getGlobal('argv').indexOf('--fake-login'))return; // if (index !== -1)

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

const startNetworkChecking = function () {
    stopNetworkChecking();
    setTimeout(() => {
        networkChecker.start();
    }, 2000);
};

const stopNetworkChecking = function () {
    networkChecker.stop();
};

/**
 * Routed events
 */
const onLoginClick = function () {
    stopNetworkChecking();
    showPage(pageAuthentication);
    session.login({
        login: controlLogin.value,
        password: controlPassword.value,
    }).then(() => {
        showPage(pageAuthenticated);
        startNetworkChecking();
    }).catch(e => {
        showPage(pageAuthenticationError);
    })
};

const onLogoutClick = function () {
    stopNetworkChecking();
    showPage(pageDisconnecting);
    session.logout().then(() => {
        showPage(pageAuthenticate);
        startNetworkChecking();
    }).catch(e => {
        showPage(pageDisconnectingError);
    });
};

const onAuthenticationErrorLoopedClick = function () {
  showPage(pageAuthenticationLoop);
};

const onAuthenticationLoopCancelClick = function () {
    showPage(pageAuthenticate);
    startNetworkChecking();
};

const onAuthenticationErrorGoBackClick = function () {
    showPage(pageAuthenticate);
    startNetworkChecking();
};

const onDisconnecingErrorForceLogoutClick = function () {
    session.isAuthenticated = false;
    showPage(pageAuthenticate);
    startNetworkChecking();
};

const onDisconnecingErrorGoBackClick = function () {
    showPage(pageAuthenticated);
    startNetworkChecking();
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
        stopNetworkChecking();
        showPage(pageAuthentication);
        session.login({
            login: controlLogin.value,
            password: controlPassword.value,
        }).then(() => {
            showPage(pageAuthenticated);
            startNetworkChecking();
        }).catch(e => {
            showPage(pageAuthenticationLoop);
        });
    }
};
networkChecker.onCheckingBegin = updateConnectionIndicator;
networkChecker.onCheckingEnd = updateConnectionIndicator;
networkChecker.start();
