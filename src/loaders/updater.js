import { Setting } from "../models/index.js";
import { makeSchedule } from "../updater/index.js";

export default async () => {
    const users = await Setting.find({ 'updater.enabled':  true }).exec();
    const scheduledTasks = {};
    for (const user of users) {
        //first exclude users where updater would do nothing
        if (user.updater.notifications === []) return;
        const checkedElements = Array.from(new Set(user.updater.notifications.map(n => n.sentElements).flat()));
        if (checkedElements === []) return;

        //then add user to the scheduled tasks
        if (!scheduledTasks[user.updater.checkFrequency]) scheduledTasks[user.updater.checkFrequency] = [user.userId];
            else scheduledTasks[user.updater.checkFrequency] = [...scheduledTasks[user.updater.checkFrequency], user.userId];
    }

    //then make schedule for each frequency
    for (const [frequency, usersArray] of Object.entries(scheduledTasks)) {
        await makeSchedule(frequency, usersArray);
    }
};