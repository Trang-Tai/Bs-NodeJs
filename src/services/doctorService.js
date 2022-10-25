import db from '../models/index';
import 'dotenv/config';
const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;

let getTopDoctorHome = (limitUser) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = await db.User.findAll({
                limit: limitUser,
                where: { roleId: 'R2' },
                order: [['createdAt', 'DESC']],
                attributes: {
                    exclude: ['password']
                },
                include: [
                    { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
                    { model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi'] },
                ],
                raw: true,
                nest: true
            })

            resolve({
                errCode: 0,
                data: users,
            })
        } catch (error) {
            reject(error);
        }
    })
}

let getAllDoctors = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctors = await db.User.findAll({
                where: { roleId: 'R2' },
                attributes: {
                    exclude: ['password', 'image'],
                }
            })
            resolve({
                errCode: 0,
                data: doctors,
            })
        } catch (error) {
            reject(error);
        }
    })
}

let saveDetailInfoDoctor = (inputData) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputData.doctorId || !inputData.action ||
                !inputData.priceId || !inputData.provinceId ||
                !inputData.paymentId || !inputData.addressClinic ||
                !inputData.nameClinic) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing input parameter',
                })
            } else {
                // upsert to Markdown table
                if (inputData.action === 'CREATE') {
                    await db.Markdown.create({
                        contentHTML: inputData.contentHTML,
                        contentMarkdown: inputData.contentMarkdown,
                        description: inputData.description,
                        doctorId: inputData.doctorId,
                    })
                } else if (inputData.action === 'EDIT') {
                    let doctorMarkdown = await db.Markdown.findOne({
                        where: { doctorId: inputData.doctorId },
                        raw: false,
                    })
                    if (doctorMarkdown) {
                        doctorMarkdown.contentHTML = inputData.contentHTML;
                        doctorMarkdown.contentMarkdown = inputData.contentMarkdown;
                        doctorMarkdown.description = inputData.description;
                        await doctorMarkdown.save();
                    }
                }

                // upsert to Doctor_infor table
                let doctorInfor = await db.Doctor_Infor.findOne({
                    where: {
                        doctorId: inputData.doctorId,
                    },
                    raw: false,
                })
                if (doctorInfor) {
                    // update
                    doctorInfor.priceId = inputData.priceId;
                    doctorInfor.provinceId = inputData.provinceId;
                    doctorInfor.paymentId = inputData.paymentId;
                    doctorInfor.nameClinic = inputData.nameClinic;
                    doctorInfor.addressClinic = inputData.addressClinic;
                    doctorInfor.note = inputData.note;
                    await doctorInfor.save();
                } else {
                    // create
                    await db.Doctor_Infor.create({
                        doctorId: inputData.doctorId,
                        priceId: inputData.priceId,
                        provinceId: inputData.provinceId,
                        paymentId: inputData.paymentId,
                        nameClinic: inputData.nameClinic,
                        addressClinic: inputData.addressClinic,
                        note: inputData.note,
                    })
                }
                resolve({
                    errCode: 0,
                    errMessage: 'Save infor doctor succeed'
                })
            }
        } catch (error) {
            reject(error);
        }
    })
}

let getDetailDoctorById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing input parameter',
                })
            }
            let data = await db.User.findOne({
                where: {
                    id: id,
                },
                attributes: {
                    exclude: ['password', 'createdAt', 'updatedAt']
                },
                include: [
                    {
                        model: db.Markdown,
                        attributes: ['description', 'contentHTML', 'contentMarkdown']
                    },
                    {
                        model: db.Allcode,
                        as: 'positionData',
                        attributes: ['valueEn', 'valueVi']
                    },
                    {
                        model: db.Doctor_Infor,
                        attributes: {
                            exclude: ['id', 'doctorId', 'createdAt', 'updatedAt']
                        },
                        include: [
                            { model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi'] },
                            { model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi'] },
                            { model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi'] }
                        ]
                    }
                ],
                raw: false,
                nest: true,
            })
            if (data && data.image) {
                data.image = Buffer.from(data.image, 'base64').toString('binary');
            }
            if (!data) data = {};
            resolve({
                errCode: 0,
                data,
            })
        } catch (error) {
            reject(error);
        }
    })
}

let bulkCreateSchedule = (data) => {
    return new Promise(async (resolve, reject) => {
        const t = await db.sequelize.transaction({ autocommit: false });
        try {
            if (!data.arrSchedule) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing required params!',
                })
            }
            let schedule = data.arrSchedule;
            if (schedule && schedule.length > 0) {
                schedule = schedule.map(item => {
                    item.maxNumber = MAX_NUMBER_SCHEDULE;
                    return item;
                })
            }
            // console.log(schedule);
            await db.Schedule.bulkCreate(schedule, { transaction: t, ignoreDuplicates: true });
            await t.commit();

            resolve({
                errCode: 0,
                errMessage: 'OK',
            })
        } catch (error) {
            await t.rollback();
            reject(error);
        }
    })
}

let getScheduleByDate = (doctorId, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId || !date) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing input parameter'
                })
            }
            const dataSchedule = await db.Schedule.findAll({
                where: {
                    doctorId: doctorId,
                    date: date,
                },
                include: [
                    {
                        model: db.Allcode,
                        as: 'timeTypeData',
                        attributes: ['valueVi', 'valueEn'],
                    },
                    {
                        model: db.User,
                        as: 'doctorData',
                        attributes: ['firstName', 'lastName'],
                    },
                ],
                raw: false,
                nest: true,
            })
            if (!dataSchedule) dataSchedule = [];
            resolve({
                errCode: 0,
                data: dataSchedule,
            })
        } catch (error) {
            reject(error);
        }
    })
}

let getExtraInfoDoctorById = (doctorId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing input parameters',
                })
            }
            let data = await db.Doctor_Infor.findOne({
                where: {
                    doctorId: doctorId
                },
                attributes: {
                    exclude: ['id', 'doctorId'],
                },
                include: [
                    { model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi'] },
                    { model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi'] },
                    { model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi'] }
                ],
                raw: false,
                nest: true,
            })
            if (!data) data = {}
            return resolve({
                errCode: 0,
                data,
            })
        } catch (error) {
            reject(error);
        }
    })
}

let getProfileDoctorById = (doctorId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing doctorId',
                })
            }
            let data = await db.User.findOne({
                where: {
                    id: doctorId,
                },
                attributes: {
                    exclude: ['password', 'createdAt', 'updatedAt']
                },
                include: [
                    {
                        model: db.Markdown,
                        attributes: ['description', 'contentHTML', 'contentMarkdown']
                    },
                    {
                        model: db.Allcode,
                        as: 'positionData',
                        attributes: ['valueEn', 'valueVi']
                    },
                    {
                        model: db.Doctor_Infor,
                        attributes: {
                            exclude: ['id', 'doctorId', 'createdAt', 'updatedAt']
                        },
                        include: [
                            { model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi'] },
                            { model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi'] },
                            { model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi'] }
                        ]
                    }
                ],
                raw: false,
                nest: true,
            })
            if (data && data.image) {
                data.image = Buffer.from(data.image, 'base64').toString('binary');
            }
            if (!data) data = {};
            resolve({
                errCode: 0,
                data,
            })
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    getTopDoctorHome,
    getAllDoctors,
    saveDetailInfoDoctor,
    getDetailDoctorById,
    bulkCreateSchedule,
    getScheduleByDate,
    getExtraInfoDoctorById,
    getProfileDoctorById,
}