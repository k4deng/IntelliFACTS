import cron from 'node-cron';
import { Setting, UpdaterData } from '../models/index.js';
import { checkSentElements, getDataChanges, getInfoChanges, sendToDiscord } from './index.js';
import { getAllClassGradesData, getAllClassGradesInfo } from "../utils/helpers/renweb/requests/grades.js";

export async function makeSchedule(frequency, users) {
    // Convert frequency to cron expression
    let cronExpression = `0 0 * * *`; //every day @ 00:00
    if (frequency < 60) cronExpression = `*/${frequency} * * * *`; //every Xth minute
        else if (frequency < 1440) cronExpression = `0 */${Math.floor(frequency / 60)} * * *`; //every Xth hour

    await cron.schedule(cronExpression, async () => {
        for (const user of users) await runUpdater(user);
    });
}

async function runUpdater(userId) {
    //get settings & changes
    const userSettings = await Setting.findOne({ userId: userId }).exec();
    const { data: dataChanges } = await getDataChanges(userId);
    const { data: infoChanges } = await getInfoChanges(userId);
    if (Object.keys(dataChanges).length === 0 && infoChanges.length === 0) return; //no changes

    //loop through array of notifications & send
    for (const { webhook, sentElements } of userSettings.updater.notifications) {
        const cleansedChanges = checkSentElements(sentElements, { ...dataChanges, ...(infoChanges.length !== 0 ? { info_changes: infoChanges } : {}) });
        await sendToDiscord(webhook, cleansedChanges, userId);
    }

    //update
    if (Object.keys(dataChanges).length !== 0) await UpdaterData.findOneAndUpdate({ userId: userId }, { data: await getAllClassGradesData(userId) });
    if (infoChanges.length !== 0) await UpdaterData.findOneAndUpdate({ userId: userId }, { info: await getAllClassGradesInfo(userId) });
}