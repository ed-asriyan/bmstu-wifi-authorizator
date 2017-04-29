/**
 * Created by ed on 27.04.17.
 */

'use strict';

const winston = require('winston');
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
        let selfRunningId = this._runningId;

        let _;
        _ = function () {
            this._setCheckingState(true);
            fetch(this._url, {
                timeout: this._timeout
            })
                .then(() => true)
                .catch(() => false)
                .then(function (checkResult) {
                    this._setCheckingState(false);
                    if (this._runningId === selfRunningId) {
                        this._setConnectionState(checkResult);
                        setTimeout(_, this._interval);
                    }
                }.bind(this));
        }.bind(this);
        _();
    }

    stop() {
        this._isConnected = undefined;
        this._isLogingIn = undefined;
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
        return this._isLogingIn;
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
            if (state) {
                winston.info('NetworkChecker', 'Connection established');
                if (this._onConnect) {
                    this._onConnect();
                }
            } else {
                winston.info('NetworkChecker', 'Connection lost');
                if (this._onDisconnect) {
                    this._onDisconnect();
                }
            }
        }
    }

    _setCheckingState(state) {
        if (state !== this._isLogingIn) {
            this._isLogingIn = state;
            if (state) {
                // wtf?? is uncomment fetch timeout will occurring
                // winston.info('NetworkChecker', 'Checking begin');
                if (this._onCheckingBegin) {
                    this._onCheckingBegin();
                }
            } else {
                winston.info('NetworkChecker', 'Checking end');
                if (this._onCheckingEnd) {
                    this._onCheckingEnd();
                }
            }
        }
    }
}

module.exports = NetworkChecker;