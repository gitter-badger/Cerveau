var Class = require("classe");
var DeltaMergeable = require("./deltaMergeable");
var extend = require("extend");
var log = require("../log");

/**
 * @abstract
 * @class BaseGameObject - the base object for any object in the game that will need to be tracked via an ID, e.g. players, units, etc.
 */
var BaseGameObject = Class(DeltaMergeable, {
    init: function(data) {
        DeltaMergeable.init.call(this, data.game, ["gameObjects", data.id], data);

        this.game = data.game;
        this.gameObjectName = this._classe.gameObjectName;
    },

    /**
     * logs a string to this BaseGameObject's log array, for debugging purposes. This is called from a 'run' event.
     *
     * @param {Player} player - the player requesting to log the string to this game object
     * @param {string} message - string to log
     * @param {Function} asyncReturn - return for async, this will never be used for log()
     */
    log: function(player, message, asyncReturn) {
        this.logs.push(message);
    },

    /**
     * String coercion override, handles players by default as every game has them
     *
     * @override
     * @returns {string} formatted string for this name
     */
    toString: function() {
        var str = "{gameObjectName} #{id}";

        // common game objects in games might have prettier strings to use
        switch(this.gameObjectName) {
            case "Player": // every game will have a 'Player' game object, but we don't have a BasePlayer object in Cerveau.
                str = "{gameObjectName} '{name}' #{id}";
                break;
            case "Tile": // TiledGames have these, so include their (x, y) position
                str = "{gameObjectName} ({x}, {y}) #{id}";
                break;
        }

        return str.format(this);
    },
});

module.exports = BaseGameObject;
