// Warehouse: A typical abandoned warehouse... that anarchists hang out in and can be bribed to burn down Buildings.

var Class = require("classe");
var log = require(__basedir + "/gameplay/log");
var Building = require("./building");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
// pass
//<<-- /Creer-Merge: requires -->>

// @class Warehouse: A typical abandoned warehouse... that anarchists hang out in and can be bribed to burn down Buildings.
var Warehouse = Class(Building, {
    /**
     * Initializes Warehouses.
     *
     * @param {Object} data - a simple mapping passsed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        Building.init.apply(this, arguments);

        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this.fireAdded = 3;

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Warehouse",


    /**
     * Bribes the Warehouse to light a Building on fire. This adds this building's fireAdded to their fire, and then this building's exposure is increased based on the Manhatten distance between the two buildings.
     *
     * @param {Player} player - the player that called this.
     * @param {Building} building - The Building you want to light on fire.
     * @param {function} asyncReturn - if you nest orders in this function you must return that value via this function in the order's callback.
     * @returns {number} The exposure added to this Building's exposure. -1 is returned if there was an error.
     */
    ignite: function(player, building, asyncReturn) {
        // <<-- Creer-Merge: ignite -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        var logicError = this._checkIfBribeIsValid(player, -1);
        if(logicError) {
            return logicError;
        }

        if(!building) {
            return this.game.logicError(-1, "Warehouse {{{0}}} sent no targeted building to ignite.".format(this.id));
        }

        if(!Class.isInstance(building, Building)) {
            return this.game.logicError(-1, "Warehouse {{{0}}} commanded to ignite building {{{1}}}, however that is not a Building, but instead a '{2}'".format(
                this.id,
                building.id,
                building.gameObjectName
            ));
        }

        if(building.isHeadquarters) {
            return this.game.logicError(-1, "Warehouse {{{0}}} commanded to ignite a headquarters.".format(this.id));
        }

        building.fire = Math.clamp(building.fire + this.fireAdded, 0, this.game.maxFire);
        var exposure = Math.manhattanDistance(this, building);
        this.exposure += exposure; // Do we want a cap on this?

        this.bribed = true;
        player.bribesRemaining--;

        return exposure;

        // <<-- /Creer-Merge: ignite -->>
    },

    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    /**
     * Makes this Warehouse into a headquarters
     *
     * @override
     */
    makeHeadquarters: function(/* ... */) {
        this.fireAdded = this.game.maxFire;
        return Building.makeHeadquarters.apply(this, arguments);
    },

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Warehouse;
