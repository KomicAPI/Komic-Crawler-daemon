// Just demo code
var Site = require('./models/site'),
	Comic = require('./models/comic'),
	Chapter = require('./models/chapter'),
	promise = require('sequelize').Promise,
	Executor = require('./lib/executor');

console.log('initializeing database');
promise.all([Site.sync(), Comic.sync(), Chapter.sync()]).then(function () {
	console.log('all created');
	// start crawling sites
	Site.findAll().then(function (instanceArray) {
		var executors = instanceArray.map(function (instance) {
			return new Executor(instance.get('crawler'));
		});

		executors.forEach(function (executor) {
			// crawling comics
			executor.comic().then(function (result) {
				console.log('comic result: ', result);
			}).catch(function (err) {
				console.error(err);
			});
		});
	}).catch(function (e) {
		console.log("catched", e);
	});
});