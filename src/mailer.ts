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

export async function mailSender(rapport: SnitchLog) {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.mail.yahoo.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.SMTPUSER,
        pass: process.env.APPPASSWORD,
      },
    });

    let corpsMessage = "";
    for (let failure of rapport.failure) {
      corpsMessage += `<p><a href="${failure}">${failure}</a></p>`;
    }

    let mailHTML = `<html><body><h1>Rapport d'échec du ${rapport.startDate?.toLocaleDateString()} à ${rapport.startDate?.toLocaleTimeString()}</h1>${corpsMessage}<p>Consultable sur <a href="http://localhost:3000/">Snitch</a></p></body></html>`;

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: "scd.uppa@yahoo.com",
      to: "antony.merle@gmail.com",
      subject: "👻 Rapport d'analyse docelec ✔",
      html: mailHTML,
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.log("Echec de l'envoi du mail de rapport:\n" + error);
  }
}
