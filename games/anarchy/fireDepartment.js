// FireDepartment: Can put out fires completely.

var Class = require("classe");
var log = require(__basedir + "/gameplay/log");
var Building = require("./building");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between cree runs
//<<-- /Creer-Merge: requires -->>

// @class FireDepartment: Can put out fires completely.
var FireDepartment = Class(Building, {
    /**
     * Initializes FireDepartments.
     *
     * @param {Object} data - a simple mapping passsed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        Building.init.apply(this, arguments);

        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this.fireExtinguished = 2;

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "FireDepartment",


    /**
     * Bribes this FireDepartment to extinguish the some of the fire in a building.
     *
     * @param {Player} player - the player that called this.
     * @param {Building} building - The Building you want to extinguish.
     * @param {function} asyncReturn - if you nest orders in this function you must return that value via this function in the order's callback.
     * @returns {boolean} True if the bribe worked, false otherwise.
     */
    extinguish: function(player, building, asyncReturn) {
        // <<-- Creer-Merge: extinguish -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        var logicError = this._checkIfBribeIsValid(player, false);
        if(logicError) {
            return logicError;
        }

        if(!building) {
            return this.game.logicError(false, "FireDepartment {{{0}}} sent no building to extinguish.".format(this.id));
        }

        if(!Class.isInstance(building, Building)) {
            return this.game.logicError(false, "FireDepartment {{{0}}} commanded to extinguish Building {{{1}}}, however that is not a Building, but instead a '{2}'".format(
                this.id,
                building.id,
                building.gameObjectName
            ));
        }

        if(building.isHeadquarters) {
            return this.game.logicError(false, "FireDepartment {{{0}}} commanded to extinguish a headquarters.".format(this.id));
        }

        building.fire = Math.clamp(building.fire - this.fireExtinguished, 0, this.game.maxFire);

        this.bribed = true;
        player.bribesRemaining--;

        return true;

        // <<-- /Creer-Merge: extinguish -->>
    },

    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    // You can add additional functions here. These functions will not be directly callable by client AIs

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = FireDepartment;
