var Sequelize = require('sequelize'),
	// sequelize = new Sequelize('postgres://komic:asdfasdfasdf@nas.ensky.tw:2345/komic', {logging: null});
	sequelize = new Sequelize('postgres://komic:asdfasdfasdf@nas.ensky.tw:2345/komic');

module.exports = sequelize;