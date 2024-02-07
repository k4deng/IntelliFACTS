import { errorHelper } from "../../../index.js";
import { schoolStudentInfo } from "./general.js";
import { makeAuthRequest } from "../authorization.js";
import moment from "moment";

export async function getHomeworkGrid(userId, term) {
    try {
        const ssInfo = await schoolStudentInfo(userId);
        const rawHWData = await makeAuthRequest(userId,
            `https://nbsmobileapi.renweb.com/api/Homework/students/${ssInfo.defaultStudentId}/schoolYearId/${ssInfo.defaultYearId}/legacyTermId/${term ?? ssInfo.defaultTermId}`
        );

        let formattedHWData = {};

        //get the homework within the selected week range
        const currentDate = moment();
        for (const timeRange of rawHWData.studentHomeworkDateRangeModels) {

            //skip if not current week
            const dateRangeStart = moment(timeRange.dateRangeStart);
            const dateRangeEnd = moment(timeRange.dateRangeEnd);
            if (!currentDate.isBetween(dateRangeStart, dateRangeEnd)) continue;

            // sort hw by class
            const classIds = [...new Set(timeRange.notesDetails.map(item => item.classId))];
            classIds.sort((a, b) => a - b);

            // Generate an array of days
            const days = [];
            for (let m = moment(dateRangeStart); m.isBefore(dateRangeEnd); m.add(1, 'days')) {
                days.push(m.format('YYYY-MM-DD'));
            }

            for (const classId of classIds) {
                // Filter the notesDetails for the current class
                const classNotes = timeRange.notesDetails.filter(item => item.classId === classId);

                // Create an object to store the classNotes for each day
                const classNotesByDay = {};

                // Sort the classNotes by eventDate (day)
                classNotes.sort((a, b) => a.eventDate.localeCompare(b.eventDate));

                // Store the sorted classNotes in the classNotesByDay object
                classNotes.forEach((note) => {
                    const eventDate = moment(note.eventDate);
                    const formattedDate = eventDate.format('YYYY-MM-DD');
                    classNotesByDay[formattedDate] = note;
                })

                // Ensure there is a classNotes object for each day
                for (const day of days) {
                    const dayOfWeek = moment(day).day();
                    if (!classNotesByDay[day] && dayOfWeek >= 1 && dayOfWeek <= 5) { // Check if the day is a weekday
                        classNotesByDay[day] = {};  // Add an empty object for the day if there is no classNotes
                    }
                }

                // Convert the classNotesByDay object into an array, sort it by date, and convert it back into an object
                formattedHWData[classId] = Object.fromEntries(Object.entries(classNotesByDay).sort());
            }
        }

        return formattedHWData;
    } catch (error) {
        return {
            type: "error",
            message: errorHelper('rw.homework.getHomeworkGridError', null, error.message).resultMessage.en
        }
    }
}