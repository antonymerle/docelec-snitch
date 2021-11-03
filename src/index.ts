import puppeteer from "puppeteer";
import dotenv from "dotenv";
import { initRessourcesLinks, initTargets } from "./urlAndTargets";
// import {  } from "./urlAndTargets";

dotenv.config({ path: "./config/.env" });

const login = async () => {
  const login = process.env.LOGIN;
  const mdp = process.env.PASSWORD;

  const URLs = await initRessourcesLinks();
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

    await browser.close();
  } catch (error) {
    console.log(error);
  }
};

login();
// initRessourcesLinks();
// initTargets().forEach((url) => console.log(url));
