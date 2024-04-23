import cron from 'node-cron';
import { Change, Setting, UpdaterData, User } from '../models/index.js';
import { checkSentElements, getDataChanges, getInfoChanges, sendToDiscord } from './index.js';
import { getAllClassGradesData, getAllClassGradesInfo } from "../utils/helpers/renweb/requests/grades.js";
import { errorHelper } from "../utils/index.js";

export async function makeSchedule(frequency, users) {
    // Convert frequency to cron expression
    let cronExpression = `0 0 * * *`; //every day @ 00:00
    if (frequency < 60) cronExpression = `*/${frequency} * * * *`; //every Xth minute
        else if (frequency < 1440) cronExpression = `0 */${Math.floor(frequency / 60)} * * *`; //every Xth hour

    await cron.schedule(cronExpression, async () => {
        for (const user of users) await runUpdater(user);
    });
}

export async function runUpdater(userId) {
    try {
        //get settings & changes
        const userSettings = await Setting.findOne({ userId: userId }).exec();
        const user = await User.findOne({ _id: userId }).exec();
        if (user.needsLogin === true) return; //skip if user needs to login
        const { data: dataChanges, message } = await getDataChanges(userId);
        const { data: infoChanges } = await getInfoChanges(userId);

        //silently update stored data even though there were no updates to be sent
        if (message === 'All classes added or removed') return await UpdaterData.findOneAndUpdate({ userId: userId }, { data: await getAllClassGradesData(userId) });

        //if there are no changes to send, return
        if (Object.keys(dataChanges).length === 0 && infoChanges.length === 0) return;

        //save changes to db
        if (Object.keys(dataChanges).length !== 0) {
            const dataChangesToSave = Object.keys(dataChanges).flatMap(key =>
                dataChanges[key].map(data => ({ userId, type: 'data', class: key, data }))
            );
            await Change.insertMany(dataChangesToSave);
        }
        if (infoChanges.length !== 0) {
            const infoChangesToSave = infoChanges.map(info => ({ userId, type: 'info', class: null, data: info }));
            await Change.insertMany(infoChangesToSave);
        }

        //loop through array of notifications & send to discord
        for (const { webhook, sentElements } of userSettings.updater.discordNotifications) {
            const cleansedChanges = checkSentElements(sentElements, { ...dataChanges, ...(infoChanges.length !== 0 ? { info_changes: infoChanges } : {}) });
            await sendToDiscord(webhook, cleansedChanges, userId);
        }

        //same but with push notifications
        /*for (const { endpoint, keys, sentElements } of userSettings.updater.pushSubscriptions) {
            const cleansedChanges = checkSentElements(sentElements, { ...dataChanges, ...(infoChanges.length !== 0 ? { info_changes: infoChanges } : {}) });
            await sendToPush(endpoint, cleansedChanges, userId);
        }*/

        //update storage with new data
        if (Object.keys(dataChanges).length !== 0) await UpdaterData.findOneAndUpdate({ userId: userId }, { data: await getAllClassGradesData(userId) });
        if (infoChanges.length !== 0) await UpdaterData.findOneAndUpdate({ userId: userId }, { info: await getAllClassGradesInfo(userId) });
    } catch (error) {
        //updater error, just log it
        errorHelper('updater.worker.runUpdaterError', { session: { user: userId }}, error.message)
    }
}