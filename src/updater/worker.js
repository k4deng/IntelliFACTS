//import cron from 'node-cron';
import { Setting } from '../models/index.js';

/*
import { getDataChanges, getInfoChanges } from "./changes.js";
import { sendToDiscord } from "./notifications.js";

const userSettings = await Setting.findOne({ userId: req.session.user });
const dataChanges = await getDataChanges(req.session.user);
await sendToDiscord(userSettings.updater.notifications[0].webhook, dataChanges.data);
const infoChanges = await getInfoChanges(req.session.user);
await sendToDiscord(userSettings.updater.notifications[0].webhook, { info_changes: infoChanges.data});
*/

export async function makeSchedule(frequency, users) {
    // Convert frequency to cron expression
    let cronExpression = `0 0 * * *`; //default to everyday @ 00:00
    if (frequency < 60) cronExpression = `*/${frequency} * * * *`; //every Xth minute
        else if (frequency < 1440) cronExpression = `0 */${Math.floor(frequency / 60)} * * *`; //every Xth hour

    console.log(cronExpression);
    //todo: finish this
}
