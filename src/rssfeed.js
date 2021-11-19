const FeedParser = require('feedparser')
const Request = require('request')
const RSSFeedItem = require('./rssfeeditem')
const Logger = require('./log')
const Config = require('./config')
const MattermostPost = require('./mattermostpost')
const _ = require('./utils')

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
    this.enabled = configObj.enabled
}

// Fetch new data from server and return the list of new items found since
// last update of the feed.
RSSFeed.prototype.fetch = function(callback) {
    let req = Request(this.rssURL)
    let parser = new FeedParser()

    // HTTP Request Events
    req.on('error', (error) => {
        Logger.warn(`[RSS] Failed to get updates for '${this.name}'': ${error}`)
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
        Logger.warn(`[RSS] Failed to get RSS from '${this.name}': ${error}`)
    })

    parser.on('readable', () => {
        this.meta = parser.meta
        let rawFeedItem
        while (rawFeedItem = parser.read()) { // read the feed and fill the array
            let feedItem = new RSSFeedItem(rawFeedItem, this)
            this.feedItems.push(feedItem)
        }
    })

    parser.on('end', () => {
        this.feedItems.sortByRecentsDate()

        newPosts = []
        if (this.last_update_ts != 0) { // filter only new articles since last check
            newPosts = this.feedItems.filter(function(feedItem) {
                return feedItem.date > this.last_update_ts
            })
        } else { // first time we add this rss feed, only get the last news.
            let max = (this.feedItems.length >= this.maxItems ? this.maxItems : this.feedItems.length)
            newPosts = this.feedItems.subarray(this.feedItems.length - max, max)
        }

        const recentPost = newPosts.last()

        Logger.info(`${this.name}:        
        - Last Update: ${this.last_update_ts.tsFormatted()}        
        - Latest Post: '${this.feedItems.last()?.title || ''}' (${this.feedItems.last()?.pubdate.tsFormatted() || ''})
        - New Posts #: ${newPosts.length}
        `)

        this.updateTimestamp(recentPost)
        callback(newPosts)
    })
}

// Update the timestamp and save it on disk.
RSSFeed.prototype.updateTimestamp = function(recentItem) {
    let timestamp = (recentItem === undefined ? Date.now() : recentItem.date)
    this.last_update_ts = timestamp // in memory check
    Config.updateRSSFeedTimestamp(this.rssURL, timestamp) // save to disk
}

// Register and execute periodic fetch to server.
RSSFeed.prototype.registerPeriodicFetch = function(seconds, callback) {
    let fetchNewItemsFnc = () => {
        Logger.info(`Updating '${this.name}'...`)
        this.fetch((newRSSItems) => { // fetch data from server
            // create a post for mattermost
            let posts = []
            let mattermostConfig = Config.data.mattermost
            for (let rssItem of newRSSItems) {
                rssItem.template = this.template
                let post = new MattermostPost(rssItem, mattermostConfig)
                posts.push(post)
            }
            callback(posts)
        })
    }

    fetchNewItemsFnc() // first time is called immediately
    setInterval(fetchNewItemsFnc, seconds)
};

module.exports = RSSFeed