let MattermostPost = function(message, obj, channel, config) {
    this.channel = channel
    this.message = message
    this.obj = obj
    this.hookURL = config.hook_url
}

module.exports = MattermostPost