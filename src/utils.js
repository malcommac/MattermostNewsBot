Array.prototype.last = function() {
    return this[this.length - 1];
}

Array.prototype.subarray = function(start, end) {
    if (!end) { end = -1; }
    return this.slice(start, this.length + 1 - (end * -1));
};

Array.prototype.sortByRecentsDate = function() {
    this.sort((l, r) => { return l.pubdate - r.pubdate })
};

Number.prototype.tsFormatted = function() {
    if (this == 0) {
        return "never"
    }

    const moment = require('moment')
    return moment(this).format("yyyy-MM-DD HH:mm")
}