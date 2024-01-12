import { makeAuthRequest } from "../authorization.js";
import { schoolStudentInfo } from "./general.js";

//TODO: add proper error handling on ALL try catch blocks

/**
 * Gets a class's grades page
 * @param {string} userId - The user's id
 * @param {string} classId - The class's id
 * @param {string} term - The term's id (optional)
 * @returns {string} - The HTML of the class's grades page
 */
export async function getClassGradesPage(userId, classId, term){

    try {
        const ssInfo = await schoolStudentInfo(userId);

        //get pwcode that is used to load webpages
        const pwcode = await makeAuthRequest(userId,"https://accounts.renweb.com/connect/userinfo").then(userinfo => userinfo.pwcode);

        //get class grades page
        return await makeAuthRequest(userId,
            `https://${ssInfo.district.districtCode}.client.renweb.com/pwr/student/gradebook_ajax.cfm` +
            `?code=${pwcode}` +
            "&code_verifier=0N5uQFllFe07PUhTot4hn4oBaUNTN3nfwOUvc3Ln0X8" +
            "&iss=https://accounts.renweb.com" +
            `&studentid=${ssInfo.defaultStudentId}` +
            "&isAjaxRequest=gradespage" +
            `&classid=${classId}` +
            `&termid=${term ?? ssInfo.defaultTermId}`
        );
    } catch (e) {
        return {
            type: "error",
            message: e.toString()
        }
    }

}