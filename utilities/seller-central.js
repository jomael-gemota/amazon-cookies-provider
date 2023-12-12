const key = require('ckey')
const path = require('path')
const puppeteer = require('puppeteer')
const playwright = require('playwright')
const { authenticator } = require('otplib')
const { delay, logger } = require('./middlewares')

const signinURL = "https://sellercentral.amazon.com/home";

const getToken = (brand) => {
    let secret = key[brand.toUpperCase() + '_AMZ_TOKEN'].replace(/\W/g, '')
    let token = authenticator.generate(secret)
    let timeRemaining= 0
    
    while(timeRemaining < 5){
        token = authenticator.generate(secret)
        timeRemaining =  authenticator.timeRemaining()
    }

    return { token, timeRemaining }
}

const otpGenerator = (secretKey) => {
	const token = authenticator.generate(secretKey)
	return token
}

const signIn = async (brand, marketplace) => {
    console.log(`Accessing cookies for ${brand.toUpperCase()}`)

    const browser = await puppeteer.launch({
        args: [
            '--enable-features=NetworkService',
            '--no-sandbox'
        ],
        ignoreHTTPSErrors: true,
        headless: true,
        slowMo: 20
    });
    
    const page = await browser.newPage()

    await page.setDefaultTimeout(0)
    await page.goto(signinURL)
    await delay(3000)

    if(await page.$('#ap_email') || await page.$('#ap_password')){
        if(await page.$('#ap_email')){
            await page.type('#ap_email', key[brand.toUpperCase() + '_AMZ_EMAIL'], { delay: 90 })
        }

        await page.type('#ap_password', key[brand.toUpperCase() + '_AMZ_PASS'], { delay: 90 })
        await page.click('#signInSubmit')
        await delay(2000)
    }

    if (await page.$('#auth-send-code')) {
        await page.click('#auth-send-code')
        await delay(2000)
    }

    if(await page.$('#auth-mfa-otpcode')){
        let { token } = await getToken(brand)

        await page.type('#auth-mfa-otpcode', token, { delay: 80 })
        await page.click('input#auth-mfa-remember-device')
        await page.click('#auth-signin-button')
        await delay(2000)
    }

    if(await page.$('div#vibes-modal-content iframe#vibes-modal-iframe')){
        await page.evaluate(() => {
            document.querySelector('div#vibes-modal-content iframe#vibes-modal-iframe').contentDocument.querySelector('body div#root div.vibes-container kat-button.vibes-form__button[variant="secondary"]').click()
        })

        await delay(2000)
    }

    // OE
    try {
        if (brand === 'oe') {
            if (marketplace === 'us') {
                await page.click('#picker-container > div > div.picker-body > div > div:nth-child(3) > div > div:nth-child(5) > button > div > div')
            } else {
                await page.click('#picker-container > div > div.picker-body > div > div:nth-child(3) > div > div:nth-child(3) > button > div > div')
            }

            await page.waitForSelector('#picker-container > div > div.picker-footer > div > button')
            await page.click('#picker-container > div > div.picker-footer > div > button')
        }
    } catch (error) {
        throw error
    }

    // EVENFLO
    try {
        if (brand === 'evenflo') {
            await page.click('#picker-container > div > div.picker-body > div > div > div > div:nth-child(2) > button > div > div')
            await delay(3000)
            await page.click('#picker-container > div > div.picker-body > div > div:nth-child(3) > div > div:nth-child(3) > button > div > div')
            await page.waitForSelector('#picker-container > div > div.picker-footer > div > button')
            await page.click('#picker-container > div > div.picker-footer > div > button')
        }
    } catch (error) {
        throw error
    }

    // WONDERSIP
    try {
        if (brand === 'wondersip') {
            await page.click('#picker-container > div > div.picker-body > div > div:nth-child(3) > div > div:nth-child(15) > button > div > div')
            await page.waitForSelector('#picker-container > div > div.picker-footer > div > button')
            await page.click('#picker-container > div > div.picker-footer > div > button')
        }
    } catch (error) {
        throw error
    }

    //WONDERFOLD
    try {
        if (brand === 'wonderfold') {
            await page.click('#picker-container > div > div.picker-body > div > div:nth-child(1) > div > div:nth-child(2) > button > div > div.picker-name')
            await delay(3000)
            await page.click('#picker-container > div > div.picker-body > div > div:nth-child(3) > div > div:nth-child(14) > button > div > div')
            await page.waitForSelector('#picker-container > div > div.picker-footer > div > button')
            await page.click('#picker-container > div > div.picker-footer > div > button')
        }
    } catch (error) {
        throw error
    }

    //DSG
    try {
        if (brand === 'dsg') {
            await page.click('#picker-container > div > div.picker-body > div > div:nth-child(1) > div > div:nth-child(1) > button > div > div.picker-name')
            await delay(3000)
            await page.click('#picker-container > div > div.picker-body > div > div:nth-child(3) > div > div:nth-child(13) > button > div > div')
            await page.waitForSelector('#picker-container > div > div.picker-footer > div > button')
            await page.click('#picker-container > div > div.picker-footer > div > button')
        }
    } catch (error) {
        throw error
    }
     
    await page.close()
    return { browser }
    
}

module.exports = { signIn }