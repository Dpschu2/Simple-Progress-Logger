// Example: node examples/determinate.js
const { Logger } = require('..');

(async () => {
    const total = 50;
    const log = new Logger({ message: 'Uploading', total });
    for (let i = 0; i <= total; i++) {
        log.update('Uploading', i);
        await new Promise(r => setTimeout(r, 120));
        if (i === 10) console.log('Halfway-ish message');
        if (i === 15) console.warn('Heads up: throttled');
        if (i === 20) console.error('Transient error recovered');
    }
    log.stop('Upload complete');
})();
