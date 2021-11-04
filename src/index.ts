import puppeteer from "puppeteer";
import dotenv from "dotenv";
import { initRessourcesLinks, initTargets } from "./urlAndTargets";
// import {  } from "./urlAndTargets";

dotenv.config({ path: "./config/.env" });

const login = async () => {
  const login = process.env.LOGIN;
  const mdp = process.env.PASSWORD;

  const URLs = await initRessourcesLinks();
  console.log(URLs);

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

    let count = 0;
    for (let url of URLs) {
      try {
        count++;
        await page.goto(url);
        const found = await page.evaluate(() => {
          // const targets = initTargets();
          const targets = [
            "UNIV DE PAU",
            "UPPA - Univ Pau",
            "Univ de Pay et des Pays de l'Adour",
            "Univ de Pau",
            "AJ3F8E98",
            "UNIV DE PAU",
            "UNIVERSITE DE PAU",
            "Univ de Pay et des Pays de l'Adour",
            "UNIVERSITE PAU & PAYS DE L ADOUR",
            "Universit de Pau et des Pays de l'Adour",
            "Université de Pau et des Pays de l'Adour",
            "Université de Pau et des Pays de l'Adour",
            "SCD de l'UPPA",
            "Université de Pau et des Pays de l'Adour",
            "UNIVERSITE DE PAU & DES PAYS DE",
            "Bienvenue UPPA",
            "Universite de Pau",
            "EFL64UNIVERSI1IK",
            "Bienvenue UNIVERSITE DE PAU",
            "Universite De Pau Et Des Pays De l'Adour",
            "Bib. Pau",
            "Universite De Pau Et Des Pays De L'Adour",
            "UNIV DE PAU ET DU PAYS DE L'ADOUR IP",
            "Bib. Pau",
            "Network access provided by: Université de Pau et des Pays de L'Adour",
            "Brought to you by:UPPA",
            "Access provided by Université de Pau & des Pays de l'Adour",
            "Univ de Pay et des Pays de l'Adour",
            "Universite De Pau Pays De L'adour",
            "Universite de Pau et des Pays de l'Adour",
          ];

          for (let target of targets) {
            if ((window as any).find(target)) return true;
          }
          return false;
        });
        console.log(count + " " + found + " " + url);
      } catch (error) {
        console.log(error);
      }
    }

    await browser.close();
    console.log("finished");
  } catch (error) {
    console.log(error);
  }
};

login();
// initRessourcesLinks();
// console.log(await initRessourcesLinks());

// initTargets().forEach((url) => console.log(url));
