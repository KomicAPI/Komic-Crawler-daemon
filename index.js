// Just demo code
var sequelize = require("sequelize"),
	Site = require('./models/site'),
	Comic = require('./models/comic'),
	Chapter = require('./models/chapter'),
	promise = require('sequelize').Promise,
	Executor = require('./lib/executor'),
	log = require('./lib/log');

log.info('initializeing database');
Site.sync()
.then(function () { return Comic.sync(); })
.then(function () { return Chapter.sync(); })
.then(function () {
	log.info('all created');
	// start crawling sites
	Site.findAll().then(function (instanceArray) {
		var executors = instanceArray.map(function (instance) {
			return new Executor(instance.get('crawler'));
		});
		executors.forEach(function (executor) {
			// crawling comics
			executor.execute("comic").then(function (result) {
				log.info('comic result: ', result);
			}).catch(function (e) {
				log.error(e);
			});
		});
	}).catch(function (e) {
		log.log(e);
	});
});
