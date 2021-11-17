const FeedParser = require('feedparser')
const Request = require('request')
const RSSFeedItem = require('./rssfeeditem')
const Logger = require('./log')
const Config = require('./config')
const MattermostPost = require('./mattermostpost')

// Initialize feed with configuration object
let RSSFeed = function(configObj) {
    this.rssURL = configObj.url
    this.name = configObj.name || ""
    this.channel = configObj.channel
    this.template = configObj.template
    this.image = configObj.image
    this.last_update_ts = configObj.last_update_ts || 0
    this.feedItems = []
    this.maxItems = configObj.maxItems
}

// Fetch new data from server and return the list of new items found since
// last update of the feed.
RSSFeed.prototype.fetch = function(callback) {
    let req = Request(this.rssURL)
    let parser = new FeedParser()

    // HTTP Request Events
    req.on('error', (error) => {
        Logger.warning(`Failed to get updates for '${this.name}'': ${error}`)
    })

    req.on('response', (res) => {
        if (res.statusCode != 200) {
            req.emit('error', new Error('Bad response'));
        } else {
            req.pipe(parser)
        }
    })

    // RSS Feed Parser Events
    parser.on('error', (error) => {
        Logger.warning(`Failed to get RSS from '${this.name}': ${error}`)
    })

    parser.on('readable', () => {
        this.meta = parser.meta
        let rawFeedItem
        while (rawFeedItem = parser.read()) { // read the feed and fill the array
            let feedItem = new RSSFeedItem(rawFeedItem)
            this.feedItems.push(feedItem)
        }
    })

    parser.on('end', () => {
        // sort by most recents
        this.feedItems.sort((l, r) => { return l.date - r.date })
        if (this.last_update_ts != 0) { // filter only new articles since last check
            this.feedItems = this.feedItems.filter(function(feedItem) {
                return feedItem.date > this.last_update_ts;
            })
            this.updateTimestamp(Date.now())
            callback(this.feedItems)
        } else { // first time we add this rss feed, only get the last news.
            this.updateTimestamp(Date.now())
            let max = (this.feedItems.length >= this.maxItems ? this.maxItems : this.feedItems.length)
            let items = this.feedItems.slice(0, max)
            callback(items)
        }
    })
}

// Update the timestamp and save it on disk.
RSSFeed.prototype.updateTimestamp = function(ts) {
    Config.updateRSSFeedTimestamp(this.rssURL, ts)
}

// Register and execute periodic fetch to server.
RSSFeed.prototype.registerPeriodicFetch = function(seconds, callback) {
    let fetchNewItemsFnc = () => {
        this.fetch((newRSSItems) => { // fetch data from server
            // create a post for mattermost
            let posts = []
            let mattermostConfig = Config.mattermost
            for (let rssItem of newRSSItems) {
                let message = rssItem.createMessageFromTemplate(this.template)
                let post = new MattermostPost(message, rssItem, this.channel, mattermostConfig)
                posts.push(post)
            }
            callback(posts)
        })
    }

    Logger.info(`Periodic update for ${this.name} set every ${seconds}s`)
    fetchNewItemsFnc() // first time is called immediately

    setInterval(fetchNewItemsFnc, seconds)
};

module.exports = RSSFeed