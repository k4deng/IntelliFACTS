import { Change } from '../../../models/index.js';

export default async (req, res) => {

    // i am so sorry this is chatgpt code and i have
    // absolutely no idea how it works

    const { page, limit } = req.query;

    const changes = await Change.find({ userId: req.session.user }).sort({ createdAt: -1 }).exec();

    const groupedData = [];
    let currentMinuteGroup = null;

    changes.forEach(entry => {
        const { createdAt, class: className } = entry;
        const minuteCreatedAt = new Date(createdAt).toISOString().slice(0, 16);

        if (!currentMinuteGroup || currentMinuteGroup.createdAt !== minuteCreatedAt) {
            currentMinuteGroup = {
                createdAt: minuteCreatedAt,
                items: []
            };
            groupedData.push(currentMinuteGroup);
        }

        let found = false;
        for (const groupItem of currentMinuteGroup.items) {
            if (groupItem.class === className) {
                groupItem.data.push(entry.data);
                found = true;
                break;
            }
        }

        if (!found) {
            if (className) {
                currentMinuteGroup.items.push({
                    class: className,
                    time: createdAt,
                    data: [entry.data]
                });
            } else {
                // If no class is specified, group it as "info_changes"
                let infoChangesItem = currentMinuteGroup.items.find(item => !item.class);
                if (!infoChangesItem) {
                    infoChangesItem = {
                        class: "info_changes",
                        time: createdAt,
                        data: []
                    };
                    currentMinuteGroup.items.push(infoChangesItem);
                }
                infoChangesItem.data.push(entry.data);
            }
        }
    });

    let finalData = [];

    // Flatten the data array within each item
    groupedData.forEach(group => {
        group.items.forEach(item => {
            finalData.push(item);
        });
    });

    const totalPages = Math.ceil(finalData.length / limit);

    return res.json({
        status: "success",
        data: {
            totalPages,
            currentPage: Number(page),
            changes: finalData.slice((page - 1) * limit, page * limit)
        }
    })
};