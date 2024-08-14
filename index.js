const { chromium } = require("playwright");
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

(async () => {
  const articles = await getHackerNewsArticles();

  app.get("/", (req, res) => {
    res.json(articles);
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
})();

async function getHackerNewsArticles() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const ageList = [];
  const titleList = [];

  await page.goto("https://news.ycombinator.com/newest");

  for (let i = 0; i < 4; i++) {
    const ages = await getArticleAges(page);
    ageList.push(...ages);

    const titles = await getArticleTitles(page);
    titleList.push(...titles);

    // Navigate to the next page
    await page.click('.morelink');
    await page.waitForTimeout(2000); // Ensure the next page loads fully
  }

  await page.close();
  await browser.close();

  return getFirstHundredArticles(ageList, titleList);
}

async function getArticleAges(page) {
  return page.$$eval('.subtext .age', elements =>
    elements.map(el => el.getAttribute('title')).filter(age => age) // Filter out null or undefined ages
  );
}

async function getArticleTitles(page) {
  // Inspecting the HTML structure to identify correct selectors
  return page.$$eval('.athing .title .titleline', elements =>
    elements.map(el => el.innerText.trim()).filter(title => title && title !== 'Hacker News') // Ensure non-empty titles
  );
}

function getFirstHundredArticles(ages, titles) {
  // Combine titles and ages into an array of objects
  return ages.slice(0, 100).map((age, index) => ({
    date: age,
    title: titles[index] || 'No title available' // Default value if title is missing
  }));
}
