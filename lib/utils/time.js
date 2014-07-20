// Return a timestamp of the curent time
function timestamp() {
    return Math.floor(Date.now() / 1000);
}

module.exports = {
    timestamp: timestamp
};
