import { makeAuthRequest } from "../authorization.js";

export async function schoolStudentInfo(userId){
    return await makeAuthRequest(userId,"https://nbsmobileapi.renweb.com/api/SchoolsAndStudents/v1?featureName=10");
}