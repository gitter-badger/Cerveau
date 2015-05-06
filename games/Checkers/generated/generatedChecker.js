// Generated by Creer at 02:43AM on May 03, 2015 UTC, git hash: '2acbba9c4b682c4de68840c1ca9bec631e9c635f'
// Note: this file should never be modified, instead if you want to add game logic modify just the ../Checker.js file. This is to ease merging main.data changes

var Class = require("../../../utilities/class");
var GameObject = require("../gameObject")


// @class GeneratedChecker: The generated version of the Checker, that handles basic logic.
var GeneratedChecker = Class(GameObject, {
	init: function(data) {
		GameObject.init.apply(this, arguments);

		this.gameObjectName = "Checker";

		this.owner = (data.owner === undefined ? null : data.owner);
		this.y = parseInt(data.y === undefined ? 0 : data.y);
		this.kinged = Boolean(data.kinged === undefined ? false : data.kinged);
		this.x = parseInt(data.x === undefined ? 0 : data.x);

		this._serializableKeys["owner"] = true;
		this._serializableKeys["y"] = true;
		this._serializableKeys["kinged"] = true;
		this._serializableKeys["x"] = true;
	},

	_runIsMine: function(player, data) {
		var returned = this.isMine(player);
		return Boolean(returned);
	},

	_runMove: function(player, data) {
		var returned = this.move(player, data.x, data.y);
		return (returned);
	},

});

module.exports = GeneratedChecker;
