// const puppeteer = require('puppeteer');
// const url = 'https://www.name.com/domain/search/mooooin.com';//name.com/domain/search/mooooin.com

// console.log("geht los")

// puppeteer
//   .launch()
//   .then(function(browser) {
//     return browser.newPage();
//   })
//   .then(function(page) {
//     return page.goto(url).then(function() {
//       return page.content();
//     });
//   })
//   .then(function(html) {
//     console.log(html)
//   })
//   .catch(function(err) {
//     //handle error
//   });

// const puppeteer = require('puppeteer');
// const $ = require('cheerio');
// const url = 'https://www.name.com/domain/search/mooooin.com';

// puppeteer
//   .launch()
//   .then(function(browser) {
//     return browser.newPage();
//   })
//   .then(function(page) {
//     return page.goto(url).then(function() {
//       return page.content();
//     });
//   })
//   .then(function(html) {
//     $('strong', html).each(function() {
//       console.log($(this).text());
//     });
//   })
//   .catch(function(err) {
//     //handle error
//   });

const Nightmare = require('nightmare')
const nightmare = Nightmare({ show: true })
const cheerio = require('cheerio');
const url = "https://www.name.com/domain/search/mooooin.com"

nightmare
    .goto(url)
    .wait("body")
    .evaluate(() => document.querySelector('body').innerHTML)
    .end()
    .then(response =>{
        console.log(response)
    }).catch(err => {
        console.log(err)
    })
    