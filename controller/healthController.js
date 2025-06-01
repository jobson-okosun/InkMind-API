module.exports.checkHealth = (req, res) => {
    // Health status is good!

    res.status(200).json({
        status: 'success',
        message: 'InkMind API is healthy and running!',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
}