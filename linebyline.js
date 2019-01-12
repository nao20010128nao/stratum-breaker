const EE = require('events').EventEmitter;
const readline = require('readline');
const net = require('net');

module.exports = class LineByLine extends EE {
    constructor(opts) {
        super();
        this.opts = opts;

        this.socket = opts.createSocket ? opts.createSocket() : new net.Socket();
        this.socket.setNoDelay(true);
        this.socket.setKeepAlive(true, 120);

        this.reader = readline.createInterface({
            input: this.socket,
            output: this.socket
        });
        this.reader.on('line', (line) => {
            this.emit('line', line);
        });

        this.socket.on("end", () => {
            this.emit("end");
        });

        this.socket.on("error", (err) => {
            this.emit("error", err);
        });

        this.socket.on("drain", () => {
            this.emit("drain");
        });

        this.socket.on("ready", () => {
            this.emit("ready");
        });

        this.socket.on("close", () => {
            this.emit("close");
        });

        this.socket.on("connect", () => {
            this.emit("connect");
        });
    }

    connect() {
        const self = this;

        return new Promise(function (resolve) {
            self.socket.connect(self.opts, function () {
                resolve(self);
            });
        });
    }

    disconnect() {
        const self = this;

        return new Promise(function (resolve) {
            self.socket.end(function () {
                resolve(self);
            });
        });
    }

    send(data) {
        const self = this;

        return new Promise(function (resolve, reject) {
            self.socket.write(data, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(self);
                }
            });
        });
    }
}