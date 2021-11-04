import puppeteer from "puppeteer";
import dotenv from "dotenv";
import { initRessourcesLinks, initTargets } from "./urlAndTargets";
// import {  } from "./urlAndTargets";

dotenv.config({ path: "./config/.env" });

const login = async () => {
  console.log("Connexion en cours");

  const login = process.env.LOGIN;
  const mdp = process.env.PASSWORD;

  const URLs = await initRessourcesLinks();
  const targets = initTargets();
  // const URLs = [
  //   "https://www-scopus-com.rproxy.univ-pau.fr/search/form.uri?display=basic#basic",
  // ];
  // console.log(URLs);

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

    let seconds = 0;

    setInterval(() => seconds++, 1000);

    let count = 0;
    let hits = 0;
    let echecs: string[] = [];
    let reussites: string[] = [];

    for (let url of URLs) {
      try {
        count++;
        await page.goto(url);
        const contentPageStr = await page.content();
        const found = contentPageStr.includes("rproxy");

        console.log(`${count}    ${found ? "vérifié" : "échec"}    ${url}`);

        if (found) {
          hits++;
          reussites.push(url);
        } else {
          let reussiteRechercheApprofondie = false;
          console.log("Recherche approfondie en cours...");

          for (let target of targets) {
            if (contentPageStr.includes(target)) {
              hits++;
              reussites.push(url);
              console.log("La recherche approfondie a réussi.");
              reussiteRechercheApprofondie = true;
              break;
            }
          }
          if (!reussiteRechercheApprofondie) {
            console.log("La recherche approfondie a échoué.");
            echecs.push(url);
          }
        }
      } catch (error) {
        echecs.push(url);
        console.log(error);
      }
    }

    await browser.close();
    clearInterval();
    console.log();

    console.log(`Analyse terminée en ${seconds} secondes`);
    console.log(
      `${hits} ressources vérifiées avec succès sur un total de ${URLs.length}`
    );
    console.log();

    console.log("Ressources vérifiées :");
    reussites.forEach((reussite) => console.log(reussite));
    console.log();

    console.log(
      "Ressources pour lesquelles la vérification a échoué : (à vérifier manuellement)"
    );
    echecs.forEach((echec) => console.log(echec));
  } catch (error) {
    console.log(error);
  }
};

login();
// initRessourcesLinks();
// console.log(await initRessourcesLinks());

// initTargets().forEach((url) => console.log(url));
