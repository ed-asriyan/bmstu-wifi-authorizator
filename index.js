/**
 * Created by ed on 25.04.17.
 */

'use strict';

const pageLogin = document.getElementById('page_login');
const pageConnecting = document.getElementById('page_connecting');
const pageConnected = document.getElementById('page_connected');
const pageDisconnecting = document.getElementById('page_disconnecting');

const forms = document.getElementById('pages').childNodes;

const showPage = function (page) {
    forms.forEach(page => page.hidden = true);
    page.hidden = false;
};

showPage(pageLogin);


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
    setTimeout(() => showPage(pageLogin), 2000);
};
