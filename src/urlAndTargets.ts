import puppeteer from "puppeteer";

export const initRessourcesLinks = async (): Promise<string[]> => {
  const publicAccessPages = [
    // "https://www.scrapethissite.com/pages/",
    "https://bibliotheques.univ-pau.fr/fr/documentation/bases-de-donnees.html",
    "https://bibliotheques.univ-pau.fr/fr/documentation/livres-electroniques.html",
    "https://bibliotheques.univ-pau.fr/fr/documentation/encyclopedies-et-dictionnaires.html",
  ];

  let ressourcesLink: (string | null)[] = [];

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    for (let url of publicAccessPages) {
      // console.log(url);
      await page.goto(url);
      const rproxyLinks = await page.evaluate(() => {
        let links: (string | null)[] = Array.from(
          document.querySelectorAll("a")
        )
          .map((link) => link.getAttribute("href"))
          .filter((link) => link?.includes("rproxy"));
        return links;
      });
      // console.log(test);
      ressourcesLink.push(...rproxyLinks);
    }
    await browser.close();
  } catch (error) {
    console.log(error);
  }

  // ressourcesLink.forEach((url) => console.log(url));
  // console.log(ressourcesLink.length);
  const set = Array.from(new Set(ressourcesLink));
  // console.log(set.length);
  return set as string[];
};

export const initTargets = (): string[] => {
  return Array.from(
    new Set([
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
    ])
  );
};

// export default initRessourcesLinks;
// export default initTargets;
