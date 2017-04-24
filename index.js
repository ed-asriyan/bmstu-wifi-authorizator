/**
 * Created by ed on 25.04.17.
 */

'use strict';

const pageLogin = document.getElementById('page_login');

const forms = document.getElementById('pages').childNodes;

const showPage = function (page) {
    forms.forEach(page => page.hidden = true);
    page.hidden = false;
};

showPage(pageLogin);