/**
 * Created by ed on 29.04.17.
 */

'use strict';

class WifiWaiter {
    constructor(session, options = {}) {
        this._session = session;
        this._interval = options.interval || 5000;
        this.stop();
    }

    start(login, password) {
        this._runningId = Math.random() * 1000 * Math.random() + 1;
        let selfRunningId = this._runningId;

        let _;
        _ = function () {
            this._setCheckingState(true);
            this._session.login({
                login: login,
                password: password,
            })
                .then(() => true)
                .catch(() => false)
                .then(function (checkResult) {
                    this._setCheckingState(false);
                    if (this._runningId === selfRunningId) {
                        if (checkResult) {
                            if (this._onLogin) {
                                this._onLogin();
                            }
                        } else {
                            setTimeout(_, this._interval);
                        }
                    }
                }.bind(this))
        }.bind(this);
        _();
    }

    stop() {
        this._isChecking = undefined;
        this._runningId = 0;
    }


    get isRunning() {
        return !this._runningId;
    }


    set onLoginBegin(value) {
        this._onLoginBegin = value;
    }

    get onLoginBegin() {
        return this._onLoginBegin;
    }


    set onLoginEnd(value) {
        this._onLoginEnd = value;
    }

    get onLoginEnd() {
        return this._onLoginEnd;
    }


    set onLogin(value) {
        this._onLogin = value;
    }

    get onLogin() {
        return this._onLogin;
    }

    _setCheckingState(state) {
        if (state !== this._isChecking) {
            this._isChecking = state;
            if (state && this._onLoginBegin) {
                this._onLoginBegin();
            } else if (!state && this._onLoginEnd) {
                this._onLoginEnd();
            }
        }
    }
}

module.exports = WifiWaiter;
