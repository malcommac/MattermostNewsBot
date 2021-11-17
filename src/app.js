let Config = require("./config")
const RSSFeed = require('./rssfeed')
const Logger = require('./log')

Logger.info(`Now loading...`)

// Read the list of feeds from config and create objects
let rssFeeds = []
for (let rawFeed of Config.data.rss) {
    rssFeeds.push(new RSSFeed(rawFeed))
}

Logger.info(`[APP] Registered ${rssFeeds.length} rss feeds...`)

// Fetch data    feed.fetch((newItems) => {
for (let rssFeed of rssFeeds) {
    // Register for periodic updates
    if (rssFeed.enabled == true) {
        rssFeed.registerPeriodicFetch(parseInt(Config.data.interval), (posts) => {
            if (posts.length == 0) {
                Logger.info(`[APP] No news from feed '${rssFeed.name}'`)
            } else {
                Logger.info(`[APP] There are ${posts.length} new posts in '${rssFeed.name}' feed`)
                for (let post of posts) {
                    post.send()
                }
            }
        })
    }
}