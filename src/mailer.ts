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

    let mailHTML = `<html><body><h1>Rapport du ${rapport.startDate?.toLocaleDateString()} à ${rapport.startDate?.toLocaleTimeString()}. ${rapport.failure.length} Echecs</h1>${corpsMessage}<p>Consultable sur <a href="http://vm-scd.univ-pau.fr/snitch">Snitch</a></p></body></html>`;

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: process.env.MAILSENDER,
      to: process.env.MAILRECEIVER1,
      subject: `👻 Rapport d'analyse docelec (${rapport.failure.length} ❌)`,
      html: mailHTML,
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.log("Echec de l'envoi du mail de rapport:\n" + error);
  }
}
