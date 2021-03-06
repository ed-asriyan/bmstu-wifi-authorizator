/**
 * Created by ed on 25.04.17.
 */

'use strict';

// todo: integrate the logger
const remote = require('electron').remote;
const fetch = require('node-fetch');
const named = require('named-regexp').named;

class Session {
    constructor(options = {}) {
        this._timeout = options.timeout || 5000;
    }

    login(options) {
        options = options || {};
        if (options.logoutId) {
            return new Promise(function (resolve) {
                this._logoutId = options.logoutId;
                resolve();
            }.bind(this));
        } else {
            let login = options.login;
            let password = options.password;

            const URL = 'https://lbpfs.bmstu.ru:8003/index.php?zone=bmstu_lb';

            return this._call('POST', URL, {
                'auth_user': login,
                'auth_pass': password,
                'accept': 'Continue',
            }).then((function (response) {
                process.stdout.write(response);
                let regex = named(/name="logout_id" +type="hidden" +value="(:<logout_id>\w+)"/);
                let matched = regex.exec(response);
                if (matched) {
                    this._logoutId = matched.capture('logout_id');
                    process.stdout.write(this._logoutId);
                } else {
                    // todo: create exception class
                    throw "Can not login";
                }
            }).bind(this));
        }
    }

    logout() {
        if (!this.isAuthenticated) {
            // todo: create exception class
            throw {};
        }

        const URL = 'https://lbpfs.bmstu.ru:8003/';

        return this._call('POST', URL, {
            'logout_id': this._logoutId,
            'zone': 'bmstu_lb',
        }).then(function (response) {
            if (response.indexOf('You have been disconnected') < 0) {
                // todo: create exception class
                throw "Can not logout";
            }
            delete this._logoutId;
        }.bind(this));
    }

    get timeout() {
        return this._timeout;
    }

    set timeout(value) {
        this._timeout = value;
    }

    get isAuthenticated() {
        return this._logoutId;
    }

    set isAuthenticated(value) {
        delete this._logoutId;
    }

    get logoutId() {
        return this._logoutId;
    }

    _call(httpMethod, url, data) {
        const initPromise = {
            method: httpMethod,
            timeout: this._timeout,
        };
        if (httpMethod === 'POST') {
            if (data !== undefined) {
                initPromise.headers = {
                    'Content-type': 'application/x-www-form-urlencoded',
                };
                initPromise.body = Object.keys(data)
                    .map(x => {
                        return `${x}=${data[x]}`;
                    }).reduce((a, b) => {
                        return `${a}&${b}`;
                    });
            }
        }

        if (~remote.getGlobal('argv').indexOf('--fake-login')) // if (index !== -1)
            return new Promise(resolve =>
                setTimeout(() => resolve('name="logout_id" type="hidden" value="frf" You have been disconnected'), 7500));
        return fetch(url, initPromise)
            .then(response => response.text());
    }
}

module.exports = Session;
