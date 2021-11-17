let Logger = {
    fatal: function(message) {
        console.log(`${currentTimestamp()}: ❌ Fatal Error: ${message}`)
        process.exit(1);
    },
    warning: function(message) {
        console.log(`${currentTimestamp()}:⚠️ Warning: ${message}`)
    },
    info: function(message) {
        console.log(`${currentTimestamp()}: ${message}`)
    },
    verbose: function(message) {
        console.log(`${currentTimestamp()}: ${message}`)
    }
}

function currentTimestamp() {
    var now = new Date()
    return now.toUTCString()
}

module.exports = Logger