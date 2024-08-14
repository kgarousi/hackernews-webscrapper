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
        await page.click('.morelink');
      }
    
      //merge array of arrays into single array
      mergedArray = ageList.flat(1);

      //close page
      await page.close();

      // get first 100 articles and store their age
      firstHun = []
      for (let i = 0; i < 100; i++){
        firstHun.push(mergedArray[i])
      }


      //send age of articles to server
      app.get("/", (req, res) => {
        res.send(
          firstHun.map(age => 
            `${age}`
          )
        );
      });
      
      //port of local server is 3000
      app.listen(3000, () => {
        console.log(`Server is running on port 3000.`);
      });
}