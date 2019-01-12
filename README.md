# stratum-breaker
Attacks to Mining Pools that uses [SMP](https://github.com/ctubio/php-proxy-stratum/wiki/Stratum-Mining-Protocol).    
Urls starting with `stratum+tcp://` is supported.    
No algo can be specified: all the algo uses same protocol. (Except for Ethereum, etc)    
    
Java version: https://github.com/nao20010128nao/StratumBreaker    

# How to use

```javascript
const Breaker = require("./index");

const b = new Breaker({
    // all options recognized from this module
    host: 'localhost',
    port: 3000,
    minerName: 'Test',
    user: 'username',
    pass: 'password'
});

b.on('ready', () => {
    // start() must be called after 'ready'
    console.log('ready');
    b.start();
});

b.once('mining.set_difficulty', diff => {
    // you can also get data from the stratum ("method" field)
    console.log("diff set:", diff[0]);
});

b.once('mining.notify', jobId => {
    console.log('job id:', jobId[0]);
});


b.on('share', function () {
    console.log('share', ...arguments);
});

// connect to the stratum (call after registering event handlers)
b.connect();
```