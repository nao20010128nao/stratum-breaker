const Client = require('./stratum-client');
const random = require('random-bytes');

module.exports = class StratumBreaker extends Client {
    constructor(opts) {
        super(opts);
        const self = this;
        self.ready = false;
        self.running = false;

        self.opts = opts;

        self.on("end", () => {
            self.ready = false;
            self.running = false;
        });

        self.on("error", () => {
            self.ready = false;
            self.running = false;
        });

        self.on("ready", () => {
            self.ready = true;
        });
    }

    start() {
        if (!this.ready) {
            throw new Error('Breaker not ready');
        } else if (this.running) {
            throw new Error('Breaker already running');
        } else {
            this.stratumSubscribe(this.opts.minerName);
            this.stratumAuthorize(this.opts.user, this.opts.pass);
            this.running = true;
            this.on('mining.notify', ([jobId, $, $$, $$$, $$$$, $$$$$, nTime]) => {
                this.jobId = jobId;
                this.nTime = nTime;
            });
            this.once('mining.notify', () => {
                setImmediate(this.sendRandomShareBatch.bind(this));
            });
        }
    }

    stop() {
        this.running = false;
        return this.disconnect();
    }

    sendRandomShareBatch() {
        if (!this.running) {
            return;
        }
        const extraNonce2 = random.sync(this.extraNonce2Size || 4).toString('hex');
        const nonce = random.sync(4).toString('hex');
        this.stratumSubmit(this.opts.user, this.jobId, extraNonce2, this.nTime, nonce);
        this.emit('share', this.opts.user, this.jobId, extraNonce2, this.nTime, nonce);
        setImmediate(this.sendRandomShareBatch.bind(this));
    }
}