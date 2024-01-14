import { makeAuthRequest } from "../authorization.js";
import { schoolStudentInfo } from "./general.js";

//TODO: add proper error handling on ALL try catch blocks

function _makeClassInfoRes(classData) {
    //get term grade style
    const termGradeStyle =
        classData.gradebookAverage === "" //nothing
            ? "secondary"
            : classData.gradebookAverage >= 90 //A
                ? "success"
                : classData.gradebookAverage >= 80 //B
                    ? "warning"
                    : classData.gradebookAverage >= 70 //C
                        ? "danger"
                        : classData.gradebookAverage >= 60 //D
                            ? "danger"
                            : "outline-danger"; //F

    return {
        classId: classData.classId,
        termId: classData.termId,
        yearId: classData.yearId,
        academicYear: classData.academicYear,
        gbkGradeMethod: classData.gbkGradeMethod,
        class: {
            name: classData.className,
            abbreviation: classData.courseAbbreviation,
            title: classData.courseTitle,
            department: classData.department
        },
        teacher: {
            id: classData.staffId,
            firstName: classData.staffFirstName,
            lastName: classData.staffLastName
        },
        termGrade: {
            average: classData.gradebookAverage == "" ? "" : classData.gradebookAverage,
            letter: classData.gradebookLetter == "" ? "N/A" : classData.gradebookLetter,
            style: termGradeStyle
        },
        gradesDisabled: classData.gradesDisabled,
        categoryGradesDisabled: classData.categoryGradesDisabled,
        fullDetailsDisabled: classData.fullDetailsDisabled
    };
}

function _makeClassDataRes(classData) {
    const data = {};
    for (const category of classData.categories) {

        data[category.title] = {
            title: category.title,
            description: category.description,
            weight: category.weight,
            //TODO: make settings to enable/disable individual notifications
            //average: category.average, //commented out because it will trigger notifications for catavg changes which i don't want
            assignments: {}
        };

        for (const assignment of category.assignments) {

            data[category.title]["assignments"][assignment.title] = {
                title: assignment.title,
                notes: assignment.notes,
                grade: assignment.grade,
                date: {
                    due: assignment.dateDue,
                    assigned: assignment.dateAssigned
                },
                points: {
                    received: assignment.pointsReceived,
                    max: assignment.pointsMax,
                    bonus: assignment.pointsBonus
                }
            };

        }

    }
    return data;
}

/**
 * Gets a class's grades page
 * @param {string} userId - The user's id
 * @param {string} classId - The class's id
 * @param {string} [term] - The term's id (optional)
 * @returns {promise} - The HTML of the class's grades page
 */
export async function getClassGradesPage(userId, classId, term){

    try {
        const ssInfo = await schoolStudentInfo(userId);

        //get pwcode that is used to load webpages
        const pwcode = await makeAuthRequest(userId,"https://accounts.renweb.com/connect/userinfo").then(userinfo => userinfo.pwcode);

        //get class grades page
        const html = await makeAuthRequest(userId,
            `https://${ssInfo.district.districtCode}.client.renweb.com/pwr/student/gradebook_ajax.cfm` +
            `?code=${pwcode}` +
            "&code_verifier=0N5uQFllFe07PUhTot4hn4oBaUNTN3nfwOUvc3Ln0X8" +
            "&iss=https://accounts.renweb.com" +
            `&studentid=${ssInfo.defaultStudentId}` +
            "&isAjaxRequest=gradespage" +
            `&classid=${classId}` +
            `&termid=${term ?? ssInfo.defaultTermId}`
        );

        return html.replace(/<script.*>.*<\/script>/ims, " "); //remove script tag that adds querys to the url
    } catch (e) {
        return {
            type: "error",
            message: e.toString()
        }
    }

}

/**
 * Gets a class's grades information
 * @param {string} userId - The user's id
 * @param {string} classId - The class's id
 * @param {string} [term] - The term's id (optional)
 * @returns {promise} - The JSON of the class's grades information
 */
export async function getClassGradesInfo(userId, classId, term){
    try {
        const ssInfo = await schoolStudentInfo(userId);

        //load all classes info
        const data = await makeAuthRequest(userId,
            `https://nbsmobileapi.renweb.com/api/StudentClasses/${ssInfo.defaultSchoolCode}/${ssInfo.defaultYearId}/${term ?? ssInfo.defaultTermId}/${ssInfo.defaultStudentId}`
        );

        //get class data for the one class
        const classData = data.find(x => x.classId == classId);

        //send it off!
        return _makeClassInfoRes(classData);
    } catch (e) {
        return {
            type: "error",
            message: e.toString()
        }
    }
}

/**
 * Gets all classes grades information
 * @param {string} userId - The user's id
 * @param {string} [term] - The term's id (optional)
 * @returns {promise} - The JSON of the classes' grades information
 */
export async function getAllClassGradesInfo(userId, term){
    try {
        const result = {};

        const ssInfo = await schoolStudentInfo(userId);

        //load all classes info
        const data = await makeAuthRequest(userId,
            `https://nbsmobileapi.renweb.com/api/StudentClasses/${ssInfo.defaultSchoolCode}/${ssInfo.defaultYearId}/${term ?? ssInfo.defaultTermId}/${ssInfo.defaultStudentId}`
        );

        //loop through classes
        for (const classData of data) {

            //hide classes with grades disabled and check whitelist/blacklist
            if (classData.gradesDisabled == true) continue;
            //TODO: add user settings for whitelist/blacklist
            //if (config.classListType == 0 && config.classList[0] && !config.classList.includes(classData.classId)) continue;
            //if (config.classListType == 1 && config.classList.includes(classData.classId)) continue;

            result[classData.classId] = _makeClassInfoRes(classData);

        }

        //send off result
        return result;
    } catch (e) {
        return {
            type: "error",
            message: e.toString()
        }
    }
}

/**
 * Gets a class's grades data
 * @param {string} userId - The user's id
 * @param {string} classId - The class's id
 * @param {string} [term] - The term's id (optional)
 * @returns {promise} - The JSON of the class's grades data
 */
export async function getClassGradesData(userId, classId, term){
    try {
        const ssInfo = await schoolStudentInfo(userId);

        //load class info
        const apidata = await makeAuthRequest(userId,`https://nbsmobileapi.renweb.com/api/StudentClasses/v2/${ssInfo.defaultSchoolCode}/${ssInfo.defaultYearId}/${term ?? ssInfo.defaultTermId}/${ssInfo.defaultStudentId}/${classId}`);

        //send it off!
        return _makeClassDataRes(apidata);
    } catch (e) {
        return {
            type: "error",
            message: e.toString()
        }
    }
}

/**
 * Gets all classes grades data
 * @param {string} userId - The user's id
 * @param {string} [term] - The term's id (optional)
 * @returns {promise} - The JSON of the classes' grades data
 */
export async function getAllClassGradesData(userId, term){
    try {
        const result = {};

        const ssInfo = await schoolStudentInfo(userId);

        //load all classes info
        const classesInfo = await makeAuthRequest(userId,
            `https://nbsmobileapi.renweb.com/api/StudentClasses/${ssInfo.defaultSchoolCode}/${ssInfo.defaultYearId}/${term ?? ssInfo.defaultTermId}/${ssInfo.defaultStudentId}`
        );

        //loop through classes
        for (const classInfo of  classesInfo) {

            //class data grades info
            const classData = await makeAuthRequest(userId, `https://nbsmobileapi.renweb.com/api/StudentClasses/v2/${ssInfo.defaultSchoolCode}/${ssInfo.defaultYearId}/${term ?? ssInfo.defaultTermId}/${ssInfo.defaultStudentId}/${classInfo.classId}`);

            //hide classes with grades disabled and check whitelist/blacklist
            if (classData.gradesDisabled == true) continue;
            //TODO: add user settings for whitelist/blacklist
            //if (config.classListType == 0 && config.classList[0] && !config.classList.includes(classData.classId)) continue;
            //if (config.classListType == 1 && config.classList.includes(classData.classId)) continue;

            result[classInfo.classId] = _makeClassDataRes(classData);

        }

        //send off result
        return result;
    } catch (e) {
        return {
            type: "error",
            message: e.toString()
        }
    }
}