/**
 * Created by ed on 25.04.17.
 */

'use strict';

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
const controlErrorDescription = document.getElementById('page_error_description');

/**
 * Routed events
 */
const onLoginClick = function () {
    showPage(pageConnecting);

    // imitating
    setTimeout(() => showPage(pageConnected), 2000);
};

const onLogoutClick = function () {
    showPage(pageDisconnecting);

    // imitating
    setTimeout(() => {
        controlErrorDescription.innerHTML = 'Unable to logout';
        showPage(pageError);
        setTimeout(() => {
            showPage(pageLogin);
        }, 2000);
    }, 2000);
};
