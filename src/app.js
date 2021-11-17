let Config = require("./config")
const RSSFeed = require('./rssfeed')
const Logger = require('./log')

Logger.info(`Now loading...`)

// Read the list of feeds from config and create objects
let rssFeeds = []
for (let rawFeed of Config.data.rss) {
    rssFeeds.push(new RSSFeed(rawFeed))
}

Logger.info(`Registered ${rssFeeds.length} rss feeds...`)

// Fetch data    feed.fetch((newItems) => {
for (let rssFeed of rssFeeds) {
    // Register for periodic updates
    rssFeed.registerPeriodicFetch(parseInt(Config.data.interval), (posts) => {
        console.log(posts.length)
    })
}