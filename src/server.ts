import express from "express";
import mysql from "mysql";
import puppeteer from "puppeteer";
import dotenv from "dotenv";
import cron from "node-cron";
import { initRessourcesLinks, initTargets } from "./urlAndTargets";
import { mailSender } from "./mailer";

dotenv.config({ path: "./config/.env" });

interface SnitchLog {
  startDate: null | Date;
  endDate: null | Date;
  durationInSeconds: number;
  success: string[];
  failure: string[];
  report: URLTableSchema[];
}

const app = express();

// ---------------- Middlewares ----------------
app.use(express.json());

// ---------------- Create MySQL DB connection ----------------
const db = mysql.createConnection({
  host: "localhost",
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: "snitch",
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("MySql connected...");
});

// ---------------- Create DB ----------------

app.get("/createdb", (req, res) => {
  const sqlr = "CREATE DATABASE snitch";
  db.query(sqlr, (err, result) => {
    if (err) res.send(err);
    console.log(result);

    res.send("Base de donnée créée ");
  });
});

// ---------------- Create tables ----------------
// TODO : revoir init table backend
app.get("/initTables", (req, res) => {
  const erreurs: mysql.MysqlError[] = [];
  const sqlrReports =
    "CREATE TABLE reports(id INT AUTO_INCREMENT, report_date_start DATETIME DEFAULT CURRENT_TIMESTAMP, report_date_end DATETIME DEFAULT null, PRIMARY KEY(id))";
  db.query(sqlrReports, (err, result) => {
    if (err) erreurs.push(err);
    console.log(result);
  });

  const sqlrURLS =
    "CREATE TABLE urls(id INT AUTO_INCREMENT, url VARCHAR(255), success TINYINT, report_id INT, PRIMARY KEY(id), FOREIGN KEY(report_id) REFERENCES reports(id))";
  db.query(sqlrURLS, (err, result) => {
    if (err) erreurs.push(err);
    console.log(result);
  });

  erreurs.length > 0
    ? res.send(erreurs)
    : res.send('Tables "urls" et "reports" créées');
  console.log(erreurs);
});

// ---------------- Database schemas ----------------

interface ReportTableSchema {
  id: number;
  report_date_start: string;
  report_date_end: string;
}

interface URLTableSchema {
  id: number;
  url: string;
  success: number;
  report_id: number;
}

// ---------------- Database queries ----------------

const DBinsertReport = async () => {
  try {
    const response: number = await new Promise((resolve, reject) => {
      db.query("INSERT INTO reports VALUES()", (err, result) => {
        if (err) reject(new Error(err.message));
        resolve(result.insertId);
      });
    });
    console.log(`Row inserted : ${response}`);
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const DBinsertURL = async (url: string, success: number, reportId: number) => {
  try {
    const response = await new Promise((resolve, reject) => {
      const query = "INSERT INTO urls(url, success, report_id) VALUES(?,?,?)";
      db.query(query, [url, success, reportId], (err, result) => {
        if (err) reject(new Error(err.message));
        resolve(result);
      });
    });
    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
  }
};

const DBfetchAllURLs = async (
  reportId: number
): Promise<Array<URLTableSchema> | null> => {
  try {
    const response: URLTableSchema[] = await new Promise((resolve, reject) => {
      const query = "SELECT * FROM urls WHERE report_id = (?)";
      db.query(query, reportId, (err, result) => {
        if (err) reject(new Error(err.message));
        resolve(result);
      });
    });
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const DBReportUpdateDateEnd = async (reportId: number) => {
  try {
    const response = await new Promise((resolve, reject) => {
      const query =
        "UPDATE reports SET report_date_end = (current_timestamp) where id = (?)";
      db.query(query, reportId, (err, result) => {
        if (err) reject(new Error(err.message));
        resolve(result);
      });
    });
    console.log(response);
  } catch (error) {
    console.log(error);
  }
};

const DBgetReportInfo = async (
  reportId: number
): Promise<ReportTableSchema | null> => {
  try {
    const response: ReportTableSchema[] = await new Promise(
      (resolve, reject) => {
        const query = "SELECT * FROM reports WHERE id = (?)";
        db.query(query, reportId, (err, result) => {
          if (err) reject(new Error(err.message));
          resolve(result);
        });
      }
    );
    console.log(response);

    return response[0];
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getLastReportId = async () => {
  interface sqlResponse {
    "MAX(id)": number;
  }
  try {
    const response: sqlResponse[] = await new Promise((resolve, reject) => {
      db.query("SELECT MAX(id) FROM reports", (err, result) => {
        if (err) reject(new Error(err.message));
        resolve(result);
      });
    });
    return response;
  } catch (err) {
    console.log(err);
  }
};

const DBGetReportList = async () => {
  interface ReportList {
    report_date_start: Date;
  }
  try {
    const response: ReportList[] | null = await new Promise(
      (resolve, reject) => {
        db.query(
          "SELECT id, report_date_start FROM reports ORDER BY id DESC",
          (err, result) => {
            if (err) reject(new Error(err.message));
            resolve(result);
          }
        );
      }
    );
    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
  }
};

// ---------------- Server routes ----------------

app.get("/test", (req, res) => {
  res.send(["poires", "pommes", "fraises"]);
});

app.get("/", (req, res) => {
  res.send("Hello Snitch !");
});

app.get("/report/list", async (req, res) => {
  const response = await DBGetReportList();
  res.send(response);
});

app.get("/report/:report_id", async (req, res) => {
  const id: number = Number(req.params.report_id);
  if (id === NaN) res.send(null);
  const reportInfo = await DBgetReportInfo(id);
  const urlsTestees = await DBfetchAllURLs(id);

  if (reportInfo && urlsTestees) {
    const snitchLog: SnitchLog = {
      startDate: new Date(reportInfo.report_date_start),
      endDate: new Date(reportInfo.report_date_end),
      durationInSeconds:
        (new Date(reportInfo.report_date_end).getTime() -
          new Date(reportInfo.report_date_start).getTime()) /
        1000,

      failure: urlsTestees
        .filter((url) => url.success === 0)
        .map((url) => url.url),
      success: urlsTestees
        .filter((url) => url.success === 1)
        .map((url) => url.url),
      report: urlsTestees.map((url) => url),
    };
    res.send(snitchLog);
  }
});

const writeReport = async (): Promise<SnitchLog> => {
  const logs: SnitchLog = {
    startDate: null,
    endDate: null,
    durationInSeconds: -1,
    success: [],
    failure: [],
    report: [],
  };

  // =====SNITCH()=======
  console.log("Connexion compte test docelec en cours...");

  const login = process.env.LOGIN;
  const mdp = process.env.PASSWORD;

  // const URLs = await initRessourcesLinks();
  const targets = initTargets();
  const URLs = [
    "https://parlipapers-proquest-com.rproxy.univ-pau.fr/parlipapers",
    "http://pubs.acs.org.rproxy.univ-pau.fr/action/showPublications?display=journals",
    "https://www-alternatives-economiques-fr.rproxy.univ-pau.fr/",
    "http://www.brepolis.net.rproxy.univ-pau.fr",
    "https://www.bnds.fr.rproxy.univ-pau.fr",
  ];
  // const URLs = [
  //   "https://www-scopus-com.rproxy.univ-pau.fr/search/form.uri?display=basic#basic",
  // ];

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto("https://www-cairn-info.rproxy.univ-pau.fr/");

    await page.type("#username", login as string);
    await page.type("#password", mdp as string);

    await Promise.all([
      page.click("#fm1 > input.btn.btn-block.btn-submit"),
      page.waitForNavigation(),
    ]);

    console.log("Connecté, démarrage de l'analyse");

    let reportID = await DBinsertReport();
    if (reportID === null) throw new Error("DBinsertReport() a échoué");
    console.log(reportID);

    let seconds = 0;
    setInterval(() => seconds++, 1000);
    let count = 0;

    for (let url of URLs) {
      try {
        count++;
        await page.goto(url);
        const contentPageStr = await page.content();
        const found = contentPageStr.includes("rproxy");
        const logLine = `${count}    ${found ? "vérifié" : "échec"}    ${url}`;
        console.log(logLine);

        if (found) {
          await DBinsertURL(url, 1, reportID);
        } else {
          let reussiteRechercheApprofondie = false;
          console.log("Recherche approfondie en cours...");

          for (let target of targets) {
            if (contentPageStr.includes(target)) {
              console.log("La recherche approfondie a réussi.");
              await DBinsertURL(url, 1, reportID);
              reussiteRechercheApprofondie = true;
              break;
            }
          }
          if (!reussiteRechercheApprofondie) {
            console.log("La recherche approfondie a échoué.");
            await DBinsertURL(url, 0, reportID);
          }
        }
      } catch (error) {
        await DBinsertURL(url, 0, reportID);
        console.log(error);
      }
    }

    await browser.close();
    await DBReportUpdateDateEnd(reportID);
    const reportInfo = await DBgetReportInfo(reportID);

    if (
      reportInfo &&
      reportInfo.report_date_start &&
      reportInfo.report_date_end
    ) {
      logs.startDate = new Date(reportInfo.report_date_start);
      logs.endDate = new Date(reportInfo.report_date_end);

      logs.durationInSeconds =
        (logs.endDate.getTime() - logs.startDate.getTime()) / 1000;
    }

    console.log(logs.startDate);
    console.log(logs.endDate);
    console.log(logs.durationInSeconds);

    console.log(`Analyse terminée en ${logs.durationInSeconds} secondes`);

    const urls = await DBfetchAllURLs(reportID);

    if (urls) {
      logs.success = urls
        .filter((url) => url.success === 1)
        .map((url) => url.url);

      logs.failure = urls
        .filter((url) => url.success === 0)
        .map((url) => url.url);

      logs.report = urls;
    }

    console.log(
      "***************************** SUCCESSES *****************************"
    );

    console.log(logs.success);
    console.log(logs.success.length);

    console.log(
      "***************************** FAILURES *****************************"
    );
    console.log(logs.failure);
    console.log(logs.failure.length);

    console.log();

    console.log(
      `${
        logs.success.length
      } ressources vérifiées avec succès sur un total de ${
        logs.success.length + logs.failure.length
      }`
    );

    console.log("Ressources vérifiées :");

    logs.success.forEach((reussite) => console.log(reussite));
    console.log();

    console.log(
      "Ressources pour lesquelles la vérification a échoué : (à vérifier manuellement)"
    );
    logs.failure.forEach((echec) => console.log(echec));
  } catch (error) {
    console.log(error);
  }

  // db.end();
  await mailSender(logs);

  return logs;
};

app.get("/snitch", async (req, res) => {
  const logs = await writeReport();
  res.send(logs);
});

cron.schedule(
  "0 6,13 * * *",
  () => {
    console.log("Lancement job à 06:00 et 13:00 Paris UTC+1");
    writeReport();
  },
  {
    scheduled: true,
    timezone: "Europe/Paris",
  }
);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
