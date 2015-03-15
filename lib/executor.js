var exec = require('child_process').exec,
	validator = require('./validator'),
	db = require('./db'),
	log = require('./log'),
	comicModel = require('../models/comic'),
	chapterModel = require('../models/chapter'),
	dbPromise = db.Promise;

var Executor = function (crawlerName) {
	this.crawlerPath = __dirname + '/../../crawlers/' + crawlerName + '/run';
};

Executor.API = 1;

Executor.param2CrawlerArgv = function () {
	var mapping = {
		comic: [],
		chapter: "comicId,comicInfo,updateInfo".split(','),
		render: "comicInfo,renderInfo".split(',')
	};
	return function (type, params) {
		var mappingArray = mapping[type];
		return mappingArray.reduce(function (arr, paramKey) {
			if (params && params[paramKey]) {
				arr.push("--" + paramKey + "=" + params[paramKey]);
			}
			return arr;
		}, ["--type=" + type, "--api=" + Executor.API]).join(' ');
	};
} ();

// saveToDB: save result JSON to Database
// TODO: verify this is working or not. We need a mockup crawler.
Executor.saveToDB = function (type, resultJSON) {
	return Executor.saveToDB[type](resultJSON);
};

Executor.saveToDB.comic = function (resultJSON) {
	return db.tranaction(function (trans) {
		var jobs = [];
		resultJSON.forEach(function (result) {
			result.comicInfo = JSON.stringify(result.comicInfo);
			jobs.push(comicModel.upsert(result, {transaction: trans}));
		});
		return dbPromise.all(jobs);
	});
};

Executor.saveToDB.chapter = function (resultJSON) {
	if (! resultJSON.modified) {
		log.info('not modified, pass.');
		return true;
	}
	var jobs = [],
		comicId = resultJSON.comicId;
	resultJSON.updateInfo = JSON.stringify(resultJSON.updateInfo);
	jobs.push(comicModel.update({updateInfo: resultJSON.updateInfo}, {
		where: {
			id: comicId
		}
	}));
	jobs.push(db.tranaction(function (trans) {
		var chain = [];
		resultJSON.chapters.forEach(function (result) {
			result.comicId = comicId;
			result.renderInfo = JSON.stringify(result.renderInfo);
			chain.push(chapterModel.upsert(result, {transaction: trans}));
		});
		return dbPromise.all(chain);
	}));
	return dbPromise.all(jobs);
};

Executor.prototype.callCrawler = function (argv) {
var me = this;
return new Promise(function (resolve, reject) {
	var executeCmd = me.crawlerPath + ' ' + argv;
	log.info("executeCmd", executeCmd);
	exec(executeCmd, function (error, stdout, stderr) {
		if (error) {
			reject(error);
		}
		resolve(stdout);
	});
});
};

Executor.prototype.execute = function (type, params) {
var me = this;
return new Promise(function (resolve, reject) {
	var argv = Executor.param2CrawlerArgv(type, params);
	me.callCrawler(argv)
	.then(function (resultJSON) {
		if (false === (resultJSON = validator.Validate(type, resultJSON))) {
			throw 'validation failed.';
		}
		return resultJSON;
	})
	.then(function (resultJSON) {
		return Executor.saveToDB(type, resultJSON);
	})
	.then(resolve)
	.catch(function (e) {
		log.error(e);
		reject("execution failed"); // TODO: error message
	});
});
};

module.exports = Executor;
