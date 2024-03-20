import { Setting, UpdaterData } from "../models/index.js";
import { getAllClassGradesData, getAllClassGradesInfo } from "../utils/helpers/renweb/requests/grades.js";
import equal from "fast-deep-equal";
import { diff as jsonDiff } from "json-diff";
import moment from "moment";
import { errorHelper } from "../utils/index.js";

/**
 * Get all changes in a user's classes info object from the saved version
 * @param userId - The user's id
 * @returns {Promise} - An object with the type, message, and data
 */
export async function getInfoChanges(userId){

    try {
        const result = [];

        // get settings
        const settings = (await Setting.findOne({ userId: userId }).exec()).updater;
        const checkedElements = Array.from(new Set(settings.notifications.map(n => n.sentElements).flat()));
        if (checkedElements === []) return {
            type: "success",
            message: "There are no enabled elements in settings to check",
            data: result
        }

        const oldData = (await UpdaterData.findOne({ userId: userId}).exec()).info;
        const newData = await getAllClassGradesInfo(userId);

        //check if there are actually changes
        if (equal(oldData, newData)) return {
            type: "success",
            message: "There were no changes",
            data: result
        }

        //generate diff
        const diff = jsonDiff(oldData, newData, { full: true });

        //find changed classes
        for (const [ subject, subjectData ] of Object.entries(diff)) {

            //class was added/removed
            if (checkedElements.includes('Class Added') && subject.endsWith("__added")) {
                result.push({
                    element: "Class Added",
                    title: subjectData.class.title + " Added",
                    description: "*Class added to FACTS or updater settings*"
                })
                continue;
            }
            if (checkedElements.includes('Class Removed') && subject.endsWith("__deleted")) {
                result.push({
                    element: "Class Removed",
                    title: subjectData.class.title + " Removed",
                    description: "*Class removed from FACTS or updater settings*"
                })
                continue;
            }

            //class renamed
            if (checkedElements.includes('Class Renamed') && subjectData.class.title.__old) result.push({
                element: "Class Renamed",
                title: subjectData.class.title.__old + " Renamed",
                description: `\`${subjectData.class.title.__old}\` ⇒ \`${subjectData.class.title.__new}\``
            })

            //teacher changed
            if (checkedElements.includes('Teacher Changed') && (subjectData.teacher.firstName.__old || subjectData.teacher.lastName.__old)) {
                const { firstName, lastName } = subjectData.teacher;
                result.push({
                    element: "Teacher Changed",
                    title: subjectData.class.title + " Teacher Changed",
                    description: `\`${firstName.__old ? firstName.__old : firstName} ${lastName.__old ? lastName.__old : lastName}\` ⇒ \`${firstName.__new ? firstName.__new : firstName} ${lastName.__new ? lastName.__new : lastName}\``
                })
            }

            //grade changed
            if (checkedElements.includes('Grade Changed') && subjectData.termGrade.average.__old) {
                const { letter, average} = subjectData.termGrade;
                let message = `\`${average.__old} (${letter.__old ? letter.__old : letter})\` ⇒ \`${average.__new} (${letter.__old ? letter.__new : letter})\``;
                if (letter.__old === "N/A") message = `\`${letter.__old}\` ⇒ \`${average.__new} (${letter.__old ? letter.__new : letter})\``;
                if (letter.__new === "N/A") message = `\`${average.__old} (${letter.__old ? letter.__old : letter})\` ⇒ \`${letter.__new}\``;
                result.push({
                    element: "Grade Changed",
                    title: subjectData.class.title + " Grade Change",
                    description: message
                })
            }

        }

        return {
            type: "success",
            message: "There were changes",
            data: result
        }

    } catch (error) {
        errorHelper('updater.changes.getInfoChangesError', { session: { user: userId }}, error.message)
        throw error;
    }
}

/**
 * Get all changes in a user's classes data object from the saved version
 * @param userId - The user's id
 * @returns {Promise} - An object with the type, message, and data
 */
export async function getDataChanges(userId){
    try {
        const result = {};

        // get settings
        const settings = (await Setting.findOne({ userId: userId }).exec()).updater;
        const checkedElements = Array.from(new Set(settings.notifications.map(n => n.sentElements).flat())); //get all elements used in notifications
        if (checkedElements === []) return {
            type: "success",
            message: "There are no elements in settings to check",
            data: result
        }

        const { info, data: oldData } = await UpdaterData.findOne({ userId: userId}).exec();
        const newData = await getAllClassGradesData(userId);

        //check if there are actually changes
        if (equal(oldData, newData)) return {
            type: "success",
            message: "There were no changes",
            data: result
        }

        //generate diff
        const diff = jsonDiff(oldData, newData, { full: false });

        //if classes were all added or all removed, ignore
        const allAdded = Object.keys(diff).every((subject) => subject.endsWith("__added"))
        const allRemoved = Object.keys(diff).every((subject) => subject.endsWith("__deleted"))
        if (allAdded || allRemoved) return {
            type: "success",
            message: "All classes added or removed",
            data: result
        }

        //find changed classes (each gets a separate object)
        for (const [ subject, subjectData ] of Object.entries(diff)) {

            //class was added/removed (ignore as data is sent in info update)
            if (subject.endsWith("__deleted") || subject.endsWith("__added")) continue;

            let classResult = [];

            //get changes in each category that was changed
            for (const [ cat, catData ] of Object.entries(subjectData)) {

                //category was added/removed
                if (checkedElements.includes('Category Added') && cat.endsWith("__added")) {
                    classResult.push({
                        element: "Category Added",
                        title: catData.title + " Added",
                        description: "*Category added to FACTS*"
                    })
                    continue;
                }
                if (checkedElements.includes('Category Removed') && cat.endsWith("__deleted")) {
                    classResult.push({
                        element: "Category Removed",
                        title: catData.title + " Removed",
                        description: "*Category removed from FACTS*"
                    })
                    continue;
                }

                //category renamed
                if (checkedElements.includes('Category Renamed') && catData.title?.__old) classResult.push({
                    element: "Category Renamed",
                    title: catData.title.__old + " Renamed",
                    description: `\`${catData.title.__old}\` ⇒ \`${catData.title.__new}\``
                })

                //category weight changed
                if (checkedElements.includes('Category Weight Changed') && catData.weight?.__old) classResult.push({
                    element: "Category Weight Changed",
                    title: newData[subject][cat].title + " Weight Changed",
                    description: `\`${catData.weight.__old}\` ⇒ \`${catData.weight.__new}\``
                })

                //assignment changed
                if (!catData.assignments) continue;
                for (const [ assignment, assignmentData ] of Object.entries(catData.assignments)) {

                    //assignment added
                    if (checkedElements.includes('Assignment Added (Graded)') && assignment.endsWith("__added")) {
                        let desc = `Grade: \`${assignmentData.grade}\``;
                        if (assignmentData.points.received != assignmentData.grade)
                            desc += ` (\`${assignmentData.points.received}\`/\`${assignmentData.points.max}\`pts)`;
                        classResult.push({
                            element: "Assignment Added (Graded)",
                            title: `**\`${assignment.replace("__added", "")}\` (\`${cat}\`) Added:**`,
                            description: desc
                        })
                    }

                    //assignment deleted
                    if (checkedElements.includes('Assignment Removed') && assignment.endsWith("__deleted")) {
                        let desc = `Was: \`${assignmentData.grade}\``;
                        if (assignmentData.points.received != assignmentData.grade)
                            desc += ` (\`${assignmentData.points.received}\`/\`${assignmentData.points.max}\`pts)`;
                        classResult.push({
                            element: "Assignment Removed",
                            title: `**\`${assignment.replace("__deleted", "")}\` (\`${cat}\`) Removed:**`,
                            description: desc
                        })
                    }

                    //pts/grade changed
                    if (checkedElements.includes('Assignment Grade Changed') && (assignmentData.grade?.__old && assignmentData.grade?.__new)) {
                        const { grade, points } = assignmentData;
                        let message = `\`${grade.__old}`;
                        if (points.received.__old != grade.__old) message += ` (${points.received.__old}/${points.max?.__old ?? points.max})\``;
                        else message += "`";
                        message += ` ⇒ \`${grade.__new}`;
                        if (points.received.__new != grade.__new) message += ` (${points.received.__new}/${points.max?.__new ?? points.max})\``;
                        else message += "`";
                        classResult.push({
                            element: "Assignment Grade Changed",
                            title: `**\`${assignment}\` (\`${cat}\`) Updated:**`,
                            description: message
                        })
                    }

                    //assignment note changed/added
                    if (checkedElements.includes('Assignment Note Changed') && assignmentData.notes?.__old !== undefined) {
                        const { notes } = assignmentData;
                        let desc = `Note Changed: \`${notes.__old}\` ⇒ \`${notes.__new}\``;
                        if (notes.__new === '') desc = `Note Deleted: \`${notes.__old}\``
                        if (notes.__old === '') desc = `Note Added: \`${notes.__new}\``

                        classResult.push({
                            element: "Assignment Note Changed",
                            title: `**\`${assignment}\` (\`${cat}\`) Updated:**`,
                            description: desc
                        })
                    }

                    //assignment due date changed
                    if (checkedElements.includes('Assignment Due Date Changed') && assignmentData.date?.due?.__old) classResult.push({
                        element: "Assignment Due Date Changed",
                        title: `**\`${assignment}\` (\`${cat}\`) Updated:**`,
                        description: `Due Date: \`${moment(assignmentData.date.due.__old).format("M/D")}\` ⇒ \`${moment(assignmentData.date.due.__new).format("M/D")}\``
                    })

                }

            }

            result[info[subject].class.title] = classResult

        }

        return {
            type: "success",
            message: "There were changes",
            data: result
        }

    } catch (error) {
        errorHelper('updater.changes.getDataChangesError', { session: { user: userId }}, error.message)
        throw error;
    }
}