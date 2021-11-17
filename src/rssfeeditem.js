let RSSFeedItem = function(rawFeedItem) {
    if (rawFeedItem) {
        this.title = rawFeedItem.title;
        this.description = rawFeedItem.description;
        this.summary = rawFeedItem.summary;
        this.link = rawFeedItem.link;
        this.date = Date.parse(rawFeedItem.date);
        this.pubdate = Date.parse(rawFeedItem.pubdate);
        this.author = rawFeedItem.author;
        this.comments = rawFeedItem.comments;
        this.image = rawFeedItem.image;
        this.categories = rawFeedItem.categories;
    }
};

RSSFeedItem.prototype.createMessageFromTemplate = function(template) {
    return template
        .replace('{{link}}', this.link)
        .replace('{{title}}', this.title)
}

module.exports = RSSFeedItem