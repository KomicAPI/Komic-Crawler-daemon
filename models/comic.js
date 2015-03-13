var Sequelize = require('sequelize'),
	db = require("../lib/db"),
	Site = require("./site");

var Comic = db.define('comic', {
	id : {type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
	title : {type: Sequelize.STRING, unique: true},
	finished : {type: Sequelize.BOOLEAN},
	comicInfo : {type: Sequelize.TEXT},
	updateInfo : {type: Sequelize.TEXT}
});

Comic.belongsTo(Site);

module.exports = Comic;