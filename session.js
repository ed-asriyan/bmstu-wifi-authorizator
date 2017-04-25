/**
 * Created by ed on 25.04.17.
 */

'use strict';

const fetch = require('node-fetch');

class Session {
    constructor() {

    }

    login(options = {}) {
        if (options.logoutId) {
            this._logoutId = options.logoutId;
        } else {
            let login = options.login;
            let password = options.password;

            const URL = 'https://lbpfs.bmstu.ru:8003/index.php?zone=bmstu_lb';

            return this._call('POST', URL, {
                auth_user: login,
                auth_pass: password,
            });
        }
    }

    logout() {
        if (this.isAuthenticated) {
            // todo: create exception class
            throw {};
        }

        const URL = 'https://lbpfs.bmstu.ru:8003/';

        return this._call('POST', URL, {
            logout_id: this._logoutId,
            zone: 'bmstu_lb',
        });
    }

    get isAuthenticated() {
        return this._logoutId;
    }

    get logoutId() {
        return this._logoutId;
    }

    _call(httpMethod, url, data) {
        const initPomise = {
            method: httpMethod
        };
        if (httpMethod === 'POST') {
            if (data !== undefined) {
                initPomise.headers = {
                    'Content-type': 'application/x-www-form-urlencoded',
                };
                initPomise.body = Object.keys(data)
                    .map(x => {
                        return `${x}=${data[x]}`;
                    }).reduce((a, b) => {
                        return `${a}&${b}`;
                    })
            }
        }
        return fetch(url, initPomise);
    }
}

module.exports = Session;
