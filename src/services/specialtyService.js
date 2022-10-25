import db from '../models/index';
import 'dotenv/config';

let createSpecialty = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.name || !data.imageBase64 || !data.descriptionHTML || !data.descriptionMarkdown) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter',
                })
            }
            await db.Specialty.create({
                name: data.name,
                image: data.imageBase64,
                descriptionHTML: data.descriptionHTML,
                descriptionMarkdown: data.descriptionMarkdown,
            })
            resolve({
                errCode: 0,
                errMessage: 'Ok',
            })
        } catch (error) {
            reject(error);
        }
    })
}

module.exports = {
    createSpecialty,
}