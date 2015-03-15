var winston = require('winston'),
	logger = new winston.Logger({
		transports: [
			new winston.transports.Console({
				handleExceptions: true,
				colorize: true
			})
		],
		exitOnError: false
	});

module.exports = logger;