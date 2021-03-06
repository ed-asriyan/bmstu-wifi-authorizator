/**
 * Created by ed on 27.04.17.
 */

'use strict';

let fetch = require('node-fetch');

class NetworkChecker {
    constructor(options = {}) {
        this._timeout = options.timeout || 6000;
        this._interval = options.interval || 5000;
        this._url = options.url || 'https://google.com';
        this.stop();
    }

    start() {
        this._runningId = Math.random() * 1000 * Math.random() + 1;

        let _;
        _ = function () {
            let selfRunningId = this._runningId;
            this._setCheckingState(true);
            fetch(this._url, {
                timeout: this._timeout
            })
                .then(() => true)
                .catch(() => false)
                .then(function (checkResult) {
                    if (this._runningId === selfRunningId) {
                        process.stdout.write(checkResult.toString());
                        this._setCheckingState(false);
                        this._setConnectionState(checkResult);
                        setTimeout(_, this._interval);
                    }
                }.bind(this));
        }.bind(this);
        _();
    }

    stop() {
        this._isConnected = undefined;
        this._isChecking = undefined;
        this._runningId = 0;
    }

    restart() {
        this.start();
    }


    get isRunning() {
        return this._runningId !== 0;
    }

    get isConnected() {
        return this._isConnected;
    }

    get isChecking() {
        return this._isChecking;
    }


    get timeout() {
        return this._timeout;
    }

    set timeout(value) {
        this._timeout = value;
    }


    get interval() {
        return this._interval;
    }

    set interval(value) {
        this._interval = value;
    }


    set onConnect(value) {
        this._onConnect = value;
    }

    get onConnect() {
        return this._onConnect;
    }


    set onDisconnect(value) {
        this._onDisconnect = value;
    }

    get onDisconnect() {
        return this._onDisconnect;
    }


    set onCheckingBegin(value) {
        this._onCheckingBegin = value;
    }

    get onCheckingBegin() {
        return this._onCheckingBegin;
    }


    set onCheckingEnd(value) {
        this._onCheckingEnd = value;
    }

    get onCheckingEnd() {
        return this._onCheckingEnd;
    }


    set onConnectionEnd(value) {
        this._onCheckingEnd = value;
    }

    get onConnectionEnd() {
        return this._onCheckingEnd;
    }


    _setConnectionState(state) {
        if (state !== this._isConnected) {
            this._isConnected = state;
            if (state && this._onConnect) {
                this._onConnect();
            } else if (!state && this._onDisconnect) {
                this._onDisconnect();
            }
        }
    }

    _setCheckingState(state) {
        if (state !== this._isChecking) {
            this._isChecking = state;
            if (state && this._onCheckingBegin) {
                this._onCheckingBegin();
            } else if (!state && this._onCheckingEnd) {
                this._onCheckingEnd();
            }
        }
    }
}

module.exports = NetworkChecker;