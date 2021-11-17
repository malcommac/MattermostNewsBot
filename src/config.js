let Logger = require('./log')
let Config = {
    data: require('./../config.json')
};

Config.updateRSSFeedTimestamp = function(feedURL, updatedTimestamp) {
    for (let rawRSSFeed of Config.data.rss) {
        if (rawRSSFeed.url === feedURL) {
            rawRSSFeed.last_update_ts = updatedTimestamp
        }
    }
    this.saveOnDisk()
}

Config.saveOnDisk = function() {
    let fs = require('fs')
    let data = JSON.stringify(this.data, null, 2)
    fs.writeFile('./config.json', data, 'utf8', (error) => {
        if (error) {
            Logger.warning(`Failed to save updated timestamps for feeds: ${error}`)
        }
    });
}

module.exports = Config