var raven = require('raven');
var bunyan = require('bunyan');
var BunyanSlack = require('bunyan-slack');
var SentryStream = require('bunyan-sentry-stream').SentryStream;

var client = new raven.Client(config.server.sentry_dsn);
var log;

var formatter = function(record, levelName) {
    return { text: '[' + levelName + '] ' + record.msg + ' (source: ' + record.src.file + ' line: ' + record.src.line + ')' };
};

try {
    log = bunyan.createLogger({
        src: true,
        name: config.server.http.host,
        streams: [{
                level: 'error',
                stream: new BunyanSlack({
                    webhook_url: config.server.slack_url,
                    channel: '#cla-assistant',
                    username: 'CLA assistant',
                    customFormatter: formatter
                })
            },
            {
                level: config.server.logging.level,
                stream: process.stdout
            },
            {
                level: 'info',
                type: 'raw', // Mandatory type for SentryStream
                stream: new SentryStream(client)
            }
        ]
    });
} catch (e) {
    log = bunyan.createLogger({
        src: true,
        name: config.server.http.host,
        streams: [{
            level: 'info',
            stream: process.stdout
        }]
    });
}

module.exports = log;
