const express = require('express');
const puppeteer = require('puppeteer');
const path = require("path");
const app = express();
const port = 3000;

app.get('/chart', async (req, res) => {
  try {
    const browser = await puppeteer.launch({ headless: "new"});

    const page = await browser.newPage();
    await page.addScriptTag({path: path.join(__dirname, 'highcharts.js')})
    // Configure the viewport and dimensions of the chart
    await page.setViewport({ width: 800, height: 600 });

    // Set up a Highcharts chart configuration
    const chartConfig = `
      Highcharts.chart('container', {
        title: {
          text: 'Sample Chart'
        },
        series: [{
          type: 'line',
          data: [1, 3, 2, 4, 5]
        }]
      });
    `;

    // Inject chart configuration and Highcharts library into the page
    await page.setContent(`
      <html>
        <body>
          <div id="container"></div>
          <script>${chartConfig}</script>
        </body>
      </html>
    `);

    // Wait for the chart to render
    // await page.waitForSelector('#container');

    // Wait for the chart's SVG element to be rendered in the page
    // await page.waitForFunction(() => {
    //     const container = document.querySelector('#container');
    //     const svg = container.querySelector('svg');
    //     return svg && svg.getAttribute('visibility') === 'visible';
    //   },  { timeout: 5000000 });

    // Capture the chart as a JPG image

    await page.waitForTimeout(2000);

    const screenshotBuffer = await page.screenshot({ type: 'jpeg' });

    // Convert the JPG image buffer to a base64 string
    const jpgBase64 = screenshotBuffer.toString('base64');

    // // Capture the chart as an SVG image
    // const svg = await page.$eval('#container', (chart) => chart.outerHTML);

    // // Convert the SVG string to a base64 string
    // const svgBase64 = Buffer.from(svg).toString('base64');

    await browser.close();

    // Send the base64 strings as a response
    res.json({ jpg: `data:image/jpeg;base64,${jpgBase64}`});
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while generating the chart' });
  }
});

app.listen(port, () => {
  console.log(`API listening at http://localhost:${port}`);
});
