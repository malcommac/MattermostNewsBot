let Config = require("./config")
const RSSFeed = require('./rssfeed')
const Logger = require('./log')
const _ = require('./utils')

Logger.info("Initializing MattermostBot...")

// Read the list of feeds from config and create objects
Logger.info("Loading RSS feeds sources...")
let rssFeeds = []
for (let rawFeed of Config.data.rss) {
    if (rawFeed.enabled == true) {
        Logger.info(`   - ${rawFeed.name}`)
        rssFeeds.push(new RSSFeed(rawFeed))
    }
}

// Fetch data    feed.fetch((newItems) => {
for (let rssFeed of rssFeeds) {
    // Register for periodic updates
    rssFeed.registerPeriodicFetch(parseInt(Config.data.interval), (posts) => {
        if (posts.length > 0) {
            Logger.info(`Sending updates for '${rssFeed.name}' (${posts.length} posts)`)
            for (let post of posts) {
                Logger.info(`  - '${post.feedItem.title}' published on: (${post.feedItem.pubdate.tsFormatted()})`)
                post.send()
            }
        }
    })
}