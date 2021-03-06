// PoliceDepartment: Used to keep cities under control and raid Warehouses.

var Class = require("classe");
var log = require(__basedir + "/gameplay/log");
var Building = require("./building");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between cree runs
//<<-- /Creer-Merge: requires -->>

// @class PoliceDepartment: Used to keep cities under control and raid Warehouses.
var PoliceDepartment = Class(Building, {
    /**
     * Initializes PoliceDepartments.
     *
     * @param {Object} data - a simple mapping passsed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        Building.init.apply(this, arguments);

        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // put any initialization logic here. the base variables should be set from 'data' above
        // NOTE: no players are connected (nor created) at this point. For that logic use 'begin()'

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "PoliceDepartment",


    /**
     * Bribe the police to raid a Warehouse, dealing damage equal based on the Warehouse's current exposure, and then resetting it to 0.
     *
     * @param {Player} player - the player that called this.
     * @param {Warehouse} warehouse - The warehouse you want to raid.
     * @param {function} asyncReturn - if you nest orders in this function you must return that value via this function in the order's callback.
     * @returns {number} The amount of damage dealt to the warehouse, or -1 if there was an error.
     */
    raid: function(player, warehouse, asyncReturn) {
        // <<-- Creer-Merge: raid -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        var logicError = this._checkIfBribeIsValid(player, -1);
        if(logicError) {
            return logicError;
        }

        if(!warehouse) {
            return this.game.logicError(-1, "PoliceDepartment {{{0}}} sent no Warehouse to raid.".format(this.id));
        }

        if(warehouse.gameObjectName !== "Warehouse") {
            return this.game.logicError(-1, "PoliceDepartment {{{0}}} commanded to raid warehouse {{{1}}}, however that is not a Warehouse, but instead a '{2}'".format(
                this.id,
                warehouse.id,
                warehouse.gameObjectName
            ));
        }

        var oldHealth = warehouse.oldHealth;
        warehouse.health = Math.max(warehouse.health - warehouse.exposure, 0);
        warehouse.exposure = 0;

        this.bribed = true;
        player.bribesRemaining--;

        return oldHealth - warehouse.health;

        // <<-- /Creer-Merge: raid -->>
    },

    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    // You can add additional functions here. These functions will not be directly callable by client AIs

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = PoliceDepartment;
