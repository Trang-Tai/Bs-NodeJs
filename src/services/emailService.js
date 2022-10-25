import 'dotenv/config';
const nodemailer = require("nodemailer");

let sendSimpleEmail = async (dataSend) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_APP, // generated ethereal user
            pass: process.env.EMAIL_APP_PASSWORD, // generated ethereal password
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"Trọng Lú 👻" <thang.trong.lu.ngu@gmail.com>', // sender address
        to: dataSend.receiverEmail, // list of receivers
        subject: "Thông tin đặt lịch khám bệnh", // Subject line
        // text: "Hello world?-jiji", // plain text body
        html: getBodyHTMLEmail(dataSend),
    });
}

let getBodyHTMLEmail = (dataSend) => {
    let result = '';
    if (dataSend.language === 'vi') {
        result = `
                    <h3>Xin chào ${dataSend.patientName}</h3>
                    <p>Bạn nhận dc email này vì đã đặt lịch khám bệnh trên Booking Care</p>
                    <p>Thông tin đặt lịch khám bệnh: </p>
                    <div><b>Thởi gian: ${dataSend.time}</b></div>
                    <div><b>Bác sĩ: ${dataSend.doctorName}</b></div>
                    <div>
                        Vui lòng click vào  
                        <a href=${dataSend.redirectLink} target="_blank">đường link này</a>
                        để xác nhận:
                    </div>
                ` // html body
    } else if (dataSend.language === 'en') {
        result = `
                    <h3>Dear ${dataSend.patientName}</h3>
                    <p>You received this email because you have booked on Booking Care</p>
                    <p>Medical examination information: </p>
                    <div><b>Timeframe: ${dataSend.time}</b></div>
                    <div><b>Doctor: ${dataSend.doctorName}</b></div>
                    <div>
                        Please click   
                        <a href=${dataSend.redirectLink} target="_blank">this link</a>
                        to confirm:
                    </div>
                ` // html body
    }
    return result;
}

module.exports = {
    sendSimpleEmail,
}