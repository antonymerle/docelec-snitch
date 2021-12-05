import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ path: "./config/.env" });

interface SnitchLog {
  startDate: null | Date;
  endDate: null | Date;
  durationInSeconds: number;
  success: string[];
  failure: string[];
  report: URLTableSchema[];
}

interface URLTableSchema {
  id: number;
  url: string;
  success: number;
  report_id: number;
}

// https://www.hostinger.fr/tutoriels/utiliser-serveur-smtp-gmail
// https://nodemailer.com/usage/using-gmail/  : accès moins sécurisé + captcha

// async..await is not allowed in global scope, must use a wrapper
export async function mailSender(rapport: SnitchLog) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  // let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.GMAILUSER, // generated ethereal user
      pass: process.env.GMAILPASSWORD, // generated ethereal password
    },
  });

  let corpsMessage = "";
  for (let failure of rapport.failure) {
    corpsMessage += `<p><a href="${failure}">${failure}</a></p>`;
  }

  let mailHTML = `<html><body><h1>Rapport d'échec du ${rapport.startDate?.toLocaleDateString()} à ${rapport.startDate?.toLocaleTimeString()}</h1>${corpsMessage}<p>Consultable sur <a href="http://localhost:3000/">Snitch</a></p></body></html>`;

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Snitch 👻" <foo@snitch.com>', // sender address
    to: "antony.merle@gmail.com", // list of receivers
    subject: "Rapport d'analyse docelec ✔", // Subject line
    // text: "Hello world?", // plain text body
    html: mailHTML, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

// mailSender().catch(console.error);
