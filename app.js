const express = require('express')
const puppeteer = require('puppeteer')
const cors = require('cors')
const { logger } = require('./utilities/middlewares')
const { signIn } = require('./utilities/seller-central')

const app = express()
const port = process.env.PORT || 5000

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: false }))
app.use(cors())

app.get('/getHeaderCookies/:brand', async (req, res) => {
	try {
		const brand = req.params.brand
		const marketplace = req.query.marketplace

	    const cookies = await getHeaderCookies(brand, marketplace)
	    
	    console.log('A cookie was delivered to someone. Happy Hacking! :)')
	    return res.json(cookies)

	} catch (error) {
		console.log(error)
		throw error
	}
})

const getHeaderCookies = async (brand, marketplace) => {
	const { browser } = await signIn(brand, marketplace)
	const page = await browser.newPage()

	let arrCookies = []

	await page.setRequestInterception(true)
	await page.setDefaultNavigationTimeout(0);

	page.on('request', request => {
	    const cookies = request.headers()['cookie']

	    if (cookies) {
	    	arrCookies.push(cookies)
	    }

  		request.continue()
	})

	await page.goto('https://sellercentral.amazon.com/home')
	await browser.close()

	return {
		brand,
		marketplace,
		message: 'A cookie was delivered to someone. Happy Hacking! :)',
		amz_cookie: arrCookies[0]
	}
}

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
})