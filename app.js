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

  await page.setViewport({ width: 1366, height: 5000 });

  try {
    const readCookies = fs.readFileSync("./cookies.txt", "utf8");
    if (readCookies.length > 0) {
      const parseCookies = JSON.parse(readCookies);
      await page.setCookie(...parseCookies);
      await page.goto(
        "https://www.linkedin.com/jobs/search/?f_AL=true&f_WT=2&geoId=103323778&keywords=Node%20Js%20React%20Js&location=M%C3%A9xico&refresh=true&sortBy=R"
      );
      await page.screenshot({ path: "example.png" });

      const jobs = await page.$$eval("div[data-job-id]", (divs) => {
        return divs.map((div) => {
          const jobId = div.getAttribute("data-job-id");

          return { jobId };
        });
      });

      for (const job of jobs) {
        const hasEasyApply = await page.evaluate(
          (jobId) =>
            !!document.querySelector(
              `div[data-job-id="${jobId}"] span.artdeco-button__text`
            ),
          job.jobId
        );
        const titulo = await page.evaluate(
          (jobId) => document.querySelector(`div[data-job-id="${jobId}"]`),
          job.jobId
        );
        job.titulo = titulo;
        job.hasEasyApply = hasEasyApply;
        job.link =
          "https://www.linkedin.com/jobs/search/?currentJobId=" +
          job.jobId +
          "&f_AL=true&f_WT=2&geoId=103323778&keywords=Node%20Js%20React%20Js&location=M%C3%A9xico&refresh=true&sortBy=R";
      }
      console.log(jobs);
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

    await page.waitForNavigation();

    const cookies = await page.cookies();
    saveCookies(cookies);
    await browser.close();
    init();
  }
  setTimeout(init, 60 * 60 * 1000);
};

init();

const saveCookies = (data) => {
  fs.writeFile("cookies.txt", JSON.stringify(data), (err) => {
    if (err) return console.log(err);
  });
};
