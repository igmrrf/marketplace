const sgMail = require('@sendgrid/mail');

const { SENDGRID_API_KEY } = require("../config/");
sgMail.setApiKey(SENDGRID_API_KEY);

const sendMail = async (recipient, emailSubject, content) => {
    const msg = {
        to: recipient,
        from: "admin@upbase.com.ng",
        subject: emailSubject,
        html: content,
    };
    try {
        let info = await sgMail.send(msg);
        console.log(`mail sent succcessfully >>> ${info}`);
        return;
    } catch (error) {
        console.error(error);
        
        if (error.response) {
            console.error(error.response.body)
        }
    }
};

module.exports = sendMail;
