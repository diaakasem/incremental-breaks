'use strict';

const Slack = require('slack-node');
const CronJob = require('cron').CronJob;
let breakMinutes = 0;
let incrementMinutes = 5;
// Close the app, if break interval exceeds 30 minutes ...
let breakIfExceeds = 30;
const hour = 60;

// Slack Constants
const slack_verification_token = process.env.SLACK_VERIFICATION_TOKEN;
const webhookUri = process.env.SLACK_WEBHOOK_URI;
const slack = new Slack();

// Used to keep nodejs process running
let haltingInterval = setInterval(function() {}, 600000)

slack.setWebhook(webhookUri);

function closeApp() {
    clearInterval(haltingInterval);
    process.exit(0);
}

function sendSlackMessage(msg) {
    console.log(msg);
    // Configure the channel and workspace in api.slack.com
    slack.webhook({
        //channel: "#general",
        //username: "webhookbot",
        text: msg
    }, function(err, response) {
        console.log(response);
    });
}

function onStart(workTime, breakTime) {
    sendSlackMessage(`
        You should start working now, for about ${workTime} minutes.
        `);
    sendSlackMessage(`
        Work time should be: ${workTime} minutes,
        Break time after ${workTime} minutes; should be ${breakTime} minutes.
        `);
}

function onBreak(workTime, breakTime) {
    sendSlackMessage(`
        You should take a break now, for about ${breakTime} minutes.
        `);
}

function main() {
    // Increment the break, by increment value
    breakMinutes += incrementMinutes;
    if (breakMinutes > breakIfExceeds) {
        return closeApp();
    }
    // Calculate the work time
    const workTime = hour - breakMinutes;
    // On the begining of every hour
    onStart(workTime, breakMinutes);
    // after the calculated worktime ends
    setTimeout(function() {
        onBreak(workTime, breakMinutes);
    }, workTime * 60 * 1000);
}

let cronJob = new CronJob({
    cronTime: '0 * * * *',
    onTick: main,
    start: true,
    timeZone:'Africa/Cairo'
});
cronJob.start();
sendSlackMessage("Good Morning, Its a really happy day! :wink: ")
