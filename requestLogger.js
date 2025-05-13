const logger = require("./logger");

const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log the incoming request details
  logger.info(`Incoming Request: ${req.method} ${req.originalUrl}`);

  // Capture the response status code after the request is handled
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    logger.info(
      `Response: ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Duration: ${duration}ms`
    );
  });

  next();
};

module.exports = requestLogger;