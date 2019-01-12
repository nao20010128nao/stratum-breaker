const LBL = require('./linebyline');

module.exports = class StratumClient extends LBL {
    constructor(opts) {
        super(opts);
        this.opts = opts;
        const self = this;

        self.authorized = false;
        self.subscription = "";
        self.name = "";
        self.pending = {};
        self.currentId = 0;

        self.on('line', line => {
            try {
                const data = JSON.parse(line);
                self.emit('json', data);
                if (data.method) {
                    // server is sending command
                    self.emit(data.method, data.params);
                } else {
                    // client is receiving response
                    self.emit(this.pending[data.id], data.result, data.error);
                }
            } catch (e) {
                self.emit("error", e);
            }
        });

        self.on('mining.authorize', (result) => {
            self.authorized = result;
        });

        self.on('mining.subscribe', (result) => {
            console.log('subscribe');
            const [subscription, extraNonce1, extraNonce2Size] = result;
            self.subscription = subscription;
            self.extraNonce1 = extraNonce1;
            self.extraNonce2Size = extraNonce2Size || 4;
        });
    }

    stratumSend(data, bypass) {
        if (this.authorized === true || bypass === true) {
            if (data.id) {
                this.pending[data.id] = data.method;
            }
            this.send(JSON.stringify(data) + "\n")
                .then(() => {})
                .catch(error => {
                    this.emit("error", error);
                });
        } else {
            this.emit("error", "Unauthorized worker");
        }
    }

    stratumSubscribe(UA) {
        this.name = UA;

        return this.stratumSend({
            method: "mining.subscribe",
            id: this.currentId++,
            params: typeof UA !== "undefined" ? [UA] : []
        }, true);
    }

    stratumAuthorize(user, pass) {
        const cred = [user, pass];
        if (!user) {
            cred = [];
        } else if (!pass) {
            cred = [user];
        }

        return this.stratumSend({
            method: "mining.authorize",
            id: this.currentId++,
            params: cred
        }, true);
    }

    stratumSubmit(worker, job_id, extranonce2, ntime, nonce) {
        return this.stratumSend({
            method: "mining.submit",
            id: this.currentId++,
            params: [worker, job_id, extranonce2, ntime, nonce]
        });
    }
}