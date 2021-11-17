let Logger = {
    fatal: function(message) {
        console.log(`❌ Fatal Error: ${message}`)
        process.exit(1);
    },
    warning: function(message) {
        console.log(`⚠️ Warning: ${message}`)
    },
    info: function(message) {
        console.log(message)
    }
}

module.exports = Logger