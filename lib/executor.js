var exec = require('child_process').exec,
	validator = require('./validator');
var Executor = function (crawlerName) {
	this.crawlerPath = __dirname + '/../../crawlers/' + crawlerName + '/run';
};
Executor.prototype.execute = function (commands) {
	var me = this; // TODO: refactor
	return new Promise(function (resolve, reject) {
		exec(me.crawlerPath + ' ' + commands, function (error, stdout, stderr) {
			if (error) {
				reject(error);
			}
			resolve(stdout);
		});
	});
};

Executor.prototype.comic = function () {
	var me = this; // TODO: refactor
	return new Promise(function (resolve, reject) {
		me.execute("--type comic").then(function (resultJSON) {
			if (false === (resultJSON = validator.Validate('comic', resultJSON))) {
				reject('validation failed.'); // TODO: error message
			} else {
				resolve(resultJSON);
			}
		}).catch(function () {
			reject("execution failed"); // TODO: error message
		});
	});
};

module.exports = Executor;