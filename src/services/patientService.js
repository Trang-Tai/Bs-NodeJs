import db from '../models/index';
import 'dotenv/config';
import emailService from './emailService';
import { v4 as uuidv4 } from 'uuid';

let buildUrlEmail = (doctorId, token) => {
    let result = `${process.env.URL_REACT}/verify-booking?token=${token}&doctorId=${doctorId}`;
    return result;
}

let postBookAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.email || !data.doctorId || !data.timeType || !data.date || !data.fullName) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter',
                })
            }
            let token = uuidv4();
            // send email to patient
            emailService.sendSimpleEmail({
                receiverEmail: data.email,
                patientName: data.fullName,
                time: data.timeString,
                doctorName: data.doctorName,
                redirectLink: buildUrlEmail(data.doctorId, token),
                language: data.language,
            });
            // upsert patient
            let [user, isCreated] = await db.User.findOrCreate({
                where: { email: data.email, },
                defaults: {
                    email: data.email,
                    roleId: 'R3',
                }
            });
            // create a booking record
            if (user) {
                await db.Booking.create({
                    statusId: 'S1',
                    doctorId: data.doctorId,
                    patientId: user.id,
                    date: data.date,
                    timeType: data.timeType,
                    token: token,
                })
            }
            resolve({
                data: user,
                errCode: 0,
                errMessage: 'Save info doctor succeed!',
            })
        } catch (error) {
            reject(error);
        }
    })
}

let postVerifyBookAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.token || !data.doctorId) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter',
                })
            }
            // tìm xem có cuộc hẹn nào chưa xác nhận hay ko
            let appointment = await db.Booking.findOne({
                where: {
                    doctorId: data.doctorId,
                    token: data.token,
                    statusId: 'S1',
                },
                raw: false,
            })
            // Nếu có cuộc hẹn thì xác nhận
            if (appointment) {
                appointment.statusId = 'S2';
                await appointment.save();
                resolve({
                    errCode: 0,
                    errMessage: 'Update the appointment succeed',
                })
            } else {
                resolve({
                    errCode: 2,
                    errMessage: 'Appointment has been activated or does not exist',
                })
            }
        } catch (error) {
            reject(error);
        }
    })
}

module.exports = {
    postBookAppointment,
    postVerifyBookAppointment,
}