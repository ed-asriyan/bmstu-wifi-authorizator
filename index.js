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
const LoginWaiter = require('./loginWaiter');

const session = new Session();
const networkChecker = new NetworkChecker();
const loginWaiter = new LoginWaiter(session);

/**
 * Pages
 */
const pageAuthenticate = document.getElementById('page_authenticate');
const pageAuthenticating = document.getElementById('page_authenticating');
const pageAuthenticated = document.getElementById('page_authenticated');
const pageDisconnecting = document.getElementById('page_disconnecting');
const pageDisconnectingError = document.getElementById('page_disconnecting_error');

const about = document.getElementById('about');
const pages = document.getElementById('pages');

const pageList = pages.childNodes;

/**
 * Controls
 */
const controlLogin = document.getElementById('page_login_username_input');
const controlPassword = document.getElementById('page_login_password_input');
const controlRememberInput = document.getElementById('form_login_remember_input');
const controlAutoLoginInput = document.getElementById('page_connected_autologin_input');
const controlInternetIndicator = document.getElementById('internet_indicator');
const controlAuthenticationLoopCaption = document.getElementById('page_authenticating_caption');
const controlAuthenticationLoopIcon = document.getElementById('page_authentication_loop_icon');

/**
 * Manage functions
 */
const showPage = function (page) {
    pageList.forEach(page => page.hidden = true);
    page.hidden = false;
};

const setAboutVisibility = function (visible) {
    about.hidden = !visible;
    pages.hidden = visible;
};

const saveState = function () {
    return new Promise(resolve => {
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
        resolve();
    }).catch(function () {
    });
};

const loadState = function () {
    return new Promise(resolve => {
        let saveObj = JSON.parse(fs.readFileSync('bmstu-wifi-authorizator.save'));

        controlLogin.value = saveObj.login || '';
        controlPassword.value = saveObj.password || '';
        controlRememberInput.checked = saveObj.saveCredentials;
        controlAutoLoginInput.checked = saveObj.autoLogin;
        if (saveObj.logoutId) {
            resolve(session.login({
                logoutId: saveObj.logoutId
            }));
        } else {
            resolve();
        }
    }).catch(function () {
    });
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
 * Go to
 */
const goToAuthenticate = function () {
    session.isAuthenticated = false;
    loginWaiter.stop();
    startNetworkChecking();
    showPage(pageAuthenticate);
};

const goToAuthenticatingLoop = function () {
    loginWaiter.stop();
    stopNetworkChecking();
    showPage(pageAuthenticating);
    controlAuthenticationLoopCaption.innerHTML = 'Logging in...';
    loginWaiter.onLogin = function () {
        goToAuthenticated();
    };
    loginWaiter.onLoginBegin = function () {
        controlAuthenticationLoopIcon.style.color = '#ccb900';
    };
    loginWaiter.onLoginEnd = function () {
        controlAuthenticationLoopIcon.style.color = '#000000';
        controlAuthenticationLoopCaption.innerHTML = 'Waiting for Wi-Fi timeout...';
    };
    loginWaiter.start(
        controlLogin.value,
        controlPassword.value
    );
};

const goToAuthenticated = function () {
    loginWaiter.stop();
    startNetworkChecking();
    showPage(pageAuthenticated);
};

const goToDisconnecting = function () {
    loginWaiter.stop();
    stopNetworkChecking();
    showPage(pageDisconnecting);
    session.logout().then(() => {
        goToAuthenticate();
    }).catch(() => {
        goToDisconnectingError();
    })
};

const goToDisconnectingError = function () {
    loginWaiter.stop();
    stopNetworkChecking();
    showPage(pageDisconnectingError);
};

/**
 * Routed events
 */
const onLoginClick = function () {
    goToAuthenticatingLoop();
};

const onLogoutClick = function () {
    goToDisconnecting();
};

const onAuthenticationLoopCancelClick = function () {
    goToAuthenticate();
};

const onLogoutErrorBackClick = function () {
    goToAuthenticated();
};

const onLogoutErrorTryAgainClick = function () {
    goToDisconnecting();
};

const onLogoutErrorForceClick = function () {
    goToAuthenticate();
};

const onAboutIndicatorClick = function () {
    setAboutVisibility(about.hidden);
};

/**
 * Logic
 */
remote.getCurrentWindow().on('close', () => {
    saveState();
});

loadState().then(() => {
    if (session.isAuthenticated) {
        goToAuthenticated();
    } else {
        goToAuthenticate();
    }
});


setAboutVisibility(false);
showPage(pageAuthenticate);

networkChecker.onConnect = updateConnectionIndicator;
networkChecker.onDisconnect = () => {
    updateConnectionIndicator();
    if (!pageAuthenticated.hidden && session.isAuthenticated && controlAutoLoginInput.checked) {
        goToAuthenticatingLoop();
    }
};
networkChecker.onCheckingBegin = updateConnectionIndicator;
networkChecker.onCheckingEnd = updateConnectionIndicator;
networkChecker.start();
