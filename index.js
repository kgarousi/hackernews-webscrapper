const { chromium } = require("playwright");
const express = require("express");
const cors = require("cors");

// Define the server setup function
function createServer(articles) {
  const app = express();
  const PORT = 5000;

  app.use(cors()); // Enable CORS for all routes
  app.use(express.json()); // Parse incoming JSON requests

  // Define a route to serve the fetched articles
  app.get("/", (req, res) => {
    res.json(articles); // Send the articles as JSON response
  });

  // Start the Express server and listen on the specified port
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`); // Log a message to the console
  });
}

// Main function to fetch articles and initialize the server
(async () => {
  const articles = await getHackerNewsArticles(); // Fetch articles from Hacker News
  createServer(articles); // Initialize the server with fetched articles
})();

// Function to fetch articles from Hacker News
async function getHackerNewsArticles() {
  const browser = await chromium.launch({ headless: false }); // Launch Chromium browser
  const context = await browser.newContext(); // Create a new browser context
  const page = await context.newPage(); // Open a new page/tab in the browser

  const ageList = []; // Array to store article ages (dates)
  const titleList = []; // Array to store article titles

  await page.goto("https://news.ycombinator.com/newest"); // Navigate to Hacker News newest page

  // Iterate to scrape multiple pages of articles
  for (let i = 0; i < 4; i++) {
    const ages = await getArticleAges(page);
    ageList.push(...ages); // Spread operator to add ages to the ageList

    const titles = await getArticleTitles(page);
    titleList.push(...titles); // Spread operator to add titles to the titleList

    await page.click('.morelink'); // Click on the "More" link to go to the next page
    await page.waitForTimeout(2000); // Wait for 2 seconds to ensure the next page loads fully
  }

  await page.close(); // Close the page
  await browser.close(); // Close the browser

  return getFirstHundredArticles(ageList, titleList); // Return the first 100 articles
}

// Function to extract article ages from the page
async function getArticleAges(page) {
  return page.$$eval('.subtext .age', elements =>
    elements.map(el => el.getAttribute('title')).filter(age => age) // Get the 'title' attribute and filter out null or undefined ages
  );
}

// Function to extract article titles from the page
async function getArticleTitles(page) {
  return page.$$eval('.athing .title .titleline', elements =>
    elements.map(el => el.innerText.trim()).filter(title => title && title !== 'Hacker News') // Get inner text, trim it, and filter out empty or irrelevant titles
  );
}

// Function to combine titles and ages into a list of article objects
function getFirstHundredArticles(ages, titles) {
  return ages.slice(0, 100).map((age, index) => ({
    date: age, // Date (age) of the article
    title: titles[index] || 'No title available' // Title of the article, defaulting to 'No title available' if missing
  }));
}