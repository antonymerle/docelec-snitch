import puppeteer from "puppeteer";
import dotenv from "dotenv";
import initRessourcesLinks from "./urlAndTargets";

dotenv.config({ path: "./config/.env" });

const login = async () => {
  const login = process.env.LOGIN;
  const mdp = process.env.PASSWORD;

  try {
    const URL = "https://www-cairn-info.rproxy.univ-pau.fr/";
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(URL);

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

// login();
initRessourcesLinks();
