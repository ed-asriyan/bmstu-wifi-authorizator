/**
 * Created by ed on 25.04.17.
 */

'use strict';

const Session = require('./session');
const session = new Session();

/**
 * Pages
 * @type {Element}
 */
const pageLogin = document.getElementById('page_login');
const pageConnecting = document.getElementById('page_connecting');
const pageConnected = document.getElementById('page_connected');
const pageDisconnecting = document.getElementById('page_disconnecting');
const pageError = document.getElementById('page_error');

const pages = document.getElementById('pages').childNodes;

const showPage = function (page) {
    pages.forEach(page => page.hidden = true);
    page.hidden = false;
};

showPage(pageLogin);

/**
 * Controls
 */
const controlLogin = document.getElementById('page_login_username_input');
const controlPassword = document.getElementById('page_login_password_input');
const controlErrorDescription = document.getElementById('page_error_description');

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
