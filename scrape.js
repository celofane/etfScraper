const puppeteer = require('puppeteer');
const etfs = require('./vaneckETF.json');
const fs = require('fs');

const scrape = async () => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    let output = [];
    for (const etf of etfs) {
        const target = etf.target.replace('ZZZ', etf.ticker);
        console.log(target);
        await page.goto(target);
        const res = await page.evaluate((etf) => {
            let ret = { ticker:'', sharesOut: null, price: null, marketPrice: null };
            try {
                ret.ticker = etf.ticker;
                ret.sharesOut = parseFloat(document.querySelector(etf.selSharesOut).innerHTML.replace(/,/g, ''));
                ret.price = parseFloat(document.querySelector(etf.selPrice).innerHTML.replace('$', '').replace(/,/g, ''));
                ret.marketPrice = parseFloat(document.querySelector(etf.selMarketPrice).innerHTML.split('<br>')[1].replace('$', '').replace(/"/g, '').replace(/,/g, ''));
            }
            catch (e) {
                console.error(e);
            }
            return ret;
        }, etf);
        output.push(res);
    }

    console.log(output);
    fs.writeFile('output.json', JSON.stringify(output), 'utf8', ()=> {});

    await browser.close();
}

scrape();