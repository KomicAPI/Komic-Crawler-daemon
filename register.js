#!/usr/bin/env node
var Site = require('./models/site'),
	argv = require('optimist').argv,
	exit = process.exit;

if (argv.name && argv.crawler
&& argv.name.length > 0 && argv.crawler.length > 0) {
	Site.sync().then(function () {
		if (!argv.d) {
			Site.create({
				name: argv.name,
				crawler: argv.crawler
			}).then(exit).catch(function(e) {
				console.log('dulpicated key');
				exit();
			});
		} else {
			Site.find({
				where: {
					name: argv.name
				}
			}).then(function (result) {
				result.destroy();
				exit();
			}).catch(function (e) {
				console.log('entry not exist');
				exit();
			});
		}
	});
} else {
	console.log('register.js --name {readable name} --crawler {crawler name} [-d]');
	console.log('-d : delete')
}
