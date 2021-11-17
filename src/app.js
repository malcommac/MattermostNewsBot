let Config = require("./config")
const RSSFeed = require('./rssfeed')
const Logger = require('./log')

Logger.info(`Welcome to MattermostNewsBot`)

// Read the list of feeds from config and create objects
Logger.info(`Loading RSS feeds...`)
let rssFeeds = []
for (let rawFeed of Config.data.rss) {
    if (rawFeed.enabled == true) {
        Logger.info(`  Adding '${rawFeed.name}'...'`)
        rssFeeds.push(new RSSFeed(rawFeed))
    }
}

Logger.info(`${rssFeeds.length} RSS feeds added!`)

// Fetch data    feed.fetch((newItems) => {
for (let rssFeed of rssFeeds) {
    // Register for periodic updates
    rssFeed.registerPeriodicFetch(parseInt(Config.data.interval), (posts) => {
        if (posts.length == 0) {
            Logger.verbose(`  [RSS] '${rssFeed.name}': no new articles found`)
        } else {
            Logger.info(`  [RSS] '${rssFeed.name}': ${posts.length} new posts`)
            for (let post of posts) {
                post.send()
            }
        }
    })
}