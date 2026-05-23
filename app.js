const { createServer } = require('http');
const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, 'server.log');
const log = (msg) => {
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] [APP.JS] ${msg}\n`);
    console.log(msg);
};

log('--- APP.JS STARTING ---');
log('ENV PORT: ' + process.env.PORT);
log('ENV PASSENGER_APP_ENV: ' + process.env.PASSENGER_APP_ENV);

try {
    const server = createServer((req, res) => {
      log('REQ: ' + req.url);
      res.end('APP_JS_ALIVE_' + new Date().toISOString());
    });

    const port = process.env.PORT || 3000;
    server.listen(port, () => {
        log('LISTENING ON ' + port);
    });
} catch (e) {
    log('CRITICAL_ERROR: ' + e.message);
}
