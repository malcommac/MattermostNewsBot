const Logger = require('./log')
let MattermostPost = function(feedItem, config) {
    this.message = feedItem.createMessageFromTemplate(feedItem.template)
    this.feedItem = feedItem
    this.hookURL = config.hook
}

MattermostPost.prototype.body = function() {
    let data = Object({
        channel: this.feedItem.feed.channel,
        text: this.message,
        icon_url: this.feedItem.feed.image,
        username: this.feedItem.feed.name
    })

    // Logger.info(JSON.stringify(data))
    return data
}

// Deliver the message to mattermost specified hook url
MattermostPost.prototype.send = function() {
    let request = require('request');
    request({
        url: this.hookURL,
        method: "POST",
        json: true,
        body: this.body(),
        strictSSL: false,
        rejectUnhauthorized: false
    }, (error, response, body) => {
        if (error) {
            Logger.warning(`[Mattermost] Failed to send post: ${error}`)
        }
    });
}

module.exports = MattermostPost