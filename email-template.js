const nodemailer = require("nodemailer");
const credentials = require("./env");
var templateZero = require("./email-templates/templateZero.js");
var templateOne = require("./email-templates/templateOne");

const sender = (template, userEmail, contactName) => {
    
    async function main(){

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport(
            {
                host: "smtp.gmail.com",
                port: 465,
                domain: "google.com",
                secure: true, // true for 465, false for other ports
                service: "Gmail",
                auth: {
                    user: process.env.USERNAME, // generated ethereal user
                    pass: process.env.PASS // generated ethereal password
                }
                
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
        from: '"FollowUp (beta)" <openwellsllc@gmail.com>', // sender address
        to: userEmail, // list of receivers
        subject: `Time to reach out to ${contactName}`, // Subject line
        text: "Opportunity to build a connection", // plain text body
        html:  template
        // html body
        });
    
        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    
        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    }
    
    main().catch(console.error);
}

const email = (userEmail, contactEmail, contactName, contactSummary) => {
    // no other templates at the moment, but a future switch-case could go here depending on contact stage
    sender(templateZero(userEmail, contactEmail, contactName, contactSummary), userEmail, contactName);
}

module.exports = email;