exports.delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

exports.logger = (from, message) => {
    console.log({ date: new Date(), from, message })
}