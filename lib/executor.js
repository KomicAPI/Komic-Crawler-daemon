var exec = require('child_process').exec;
var Executor = function (crawlerName) {
	this.crawlerPath = __dirname + '/../../crawlers/' + crawlerName + '/run';
};

Executor.Types = {
	INT: 0x1,
	BOOL: 0x2,
	JSON: 0x4,
	STRING: 0x8
};

Executor.Validators = {};
Executor.Validators[Executor.Types.INT] = function (type) {
	return ! isNaN(parseInt(type, 10));
};
Executor.Validators[Executor.Types.BOOL] = function (type) {
	return typeof type === 'boolean' || type.toLowerCase() === 'true' || type.toLowerCase() === 'false';
};
Executor.Validators[Executor.Types.JSON] = function (type) {
	var isValid = true;
	try {
		JSON.parse(type)
	} catch (e) {
		isValid = false;
	}
	return isValid;
};
Executor.Validators[Executor.Types.STRING] = function (type) {
	return typeof type === 'string';
};

Executor.Formats = {
	comic: {
		title: Executor.Types.STRING,
		finished: Executor.Types.BOOL,
		comicInfo: Executor.Types.JSON
	},
	chapter: {
		comicId: Executor.Types.INT,
		modified: Executor.Types.BOOL,
		updateInfo: Executor.Types.JSON,
		chapters: {
			_isArray: true,
			title: Executor.Types.STRING,
			no: Executor.Types.INT,
			pages: Executor.Types.INT,
			renderInfo: Executor.Types.JSON
		}
	},
	render: {
		_isArray: true,
		url: Executor.Types.URL,
		referer: Executor.Types.URL
	}
};

Executor.ValidateObject = function (root, doc) {
	// to be implemented
	return true;
};

Executor.Validate = function (type, jsonString) {
	try {
		var json = JSON.parse(jsonString);	
		if (Executor.ValidateObject(json, Executor.Formats[type])) {
			return json;
		}
	} catch (e) {
		console.error(e);
		return false;
	}
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
			if (false === (resultJSON = Executor.Validate('comic', resultJSON))) {
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