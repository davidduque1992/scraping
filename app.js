const puppeteer = require("puppeteer");
const randomUseragent = require("random-useragent");
const fs = require("fs");
const init = async () => {
  const header = randomUseragent.getRandom((ua) => {
    return ua.browserName === "Firefox";
  });
  console.log(header);

  const browser = await puppeteer.launch({
    headless: false,
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();

  await page.setUserAgent(header);

  await page.setViewport({ width: 1366, height: 768 });
  try {
    const readCookies = fs.readFileSync("./cookies.txt", "utf8");
    if (readCookies.length > 0) {
      const readCookies = fs.readFileSync("./cookies.txt", "utf8");
      const parseCookies = JSON.parse(readCookies);
      await page.setCookie(...parseCookies);
      await page.goto("https://www.linkedin.com/company/bendoapp");
    //   await page.waitForNavigation();
    //   await browser.close();
      await page.screenshot({ path: "example.png" });
    } else {
      console.log("No hay cookies");
    }
    await browser.close();
  } catch (error) {
    await page.goto(
      "https://www.linkedin.com/login/es?fromSignIn=true&trk=guest_homepage-basic_nav-header-signin"
    );

    await page.type("#username", "davidduque1992@gmail.com");
    await page.type("#password", "06/11/2011");
    await page.click('[data-litms-control-urn="login-submit"]');
    //   await page.waitForNavigation();

    await page.waitForNavigation();

    const cookies = await page.cookies();
    saveCookies(cookies);
    await browser.close();
    init();
  }

  //--------------------------------------------------------------------------segunda parte

  //   await page.screenshot({ path: "example.png" });
};
init();

saveCookies = (data) => {
  fs.writeFile("cookies.txt", JSON.stringify(data), (err) => {
    if (err) return console.log(err);
  });
};
