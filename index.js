// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

(async () => {
  await sortHackerNewsArticles();
})();


async function sortHackerNewsArticles() {
  // launch browser
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    const ageList = [];
    const titleList = [];

  // go to Hacker News
      await page.goto("https://news.ycombinator.com/newest");
  // grab articles age from first 4 pages and store in array of arrays
      for(let i = 0; i < 4; i++){  
        const ages = await page.$$eval('.subtext > .subline ', allAges => {
          const data = [];
          allAges.forEach(articleAge => {
              const ageEl = articleAge.querySelector('.age');
              const age = ageEl.getAttribute('title');
              data.push(age);
            });
            return data 
        })
        ageList.push(ages);
        
        const titles = await page.$$eval('.athing > .title > .titleline', allTitles => {
          const data = [];
          allTitles.forEach(articleTitle => {
              const titleEl = articleTitle.querySelector('a');
              const title = titleEl ? titleEl.innerText : null;
              data.push(title);
          });
          return data;
        });
        titleList.push(titles)

        await page.click('.morelink');
      }
    
      //merge array of arrays into single array
      mergedAgeArray = ageList.flat(1);
      mergedTitleArray = titleList.flat(1);

      //close page
      await page.close();

      // get first 100 articles and store their age and titles
      firstHun = []
      for (let i = 0; i < 100; i++){
        firstHun.push({"date": mergedAgeArray[i], "title" : mergedTitleArray[i]})
      }

      console.log(firstHun)

      //send age of articles to server
      app.get("/", (req, res) => {
        res.json(
          firstHun
        );
      });
      
      //port of local server is 5000
      app.listen(5000, () => {
        console.log(`Server is running on port 5000.`);
      });
}