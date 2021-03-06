// BroodMother: The Spider Queen. She alone can spawn Spiderlings for each Player, and if she dies the owner loses.

var Class = require("classe");
var log = require(__basedir + "/gameplay/log");
var Spider = require("./spider");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

var Spiderling = require("./spiderling");

//<<-- /Creer-Merge: requires -->>

// @class BroodMother: The Spider Queen. She alone can spawn Spiderlings for each Player, and if she dies the owner loses.
var BroodMother = Class(Spider, {
    /**
     * Initializes BroodMothers.
     *
     * @param {Object} data - a simple mapping passsed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        Spider.init.apply(this, arguments);

        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // put any initialization logic here. the base variables should be set from 'data' above

        this.health = 100;

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "BroodMother",


    /**
     * Consumes a Spiderling of the same owner to regain some eggs to spawn more Spiderlings.
     *
     * @param {Player} player - the player that called this.
     * @param {Spiderling} spiderling - The Spiderling to consume. It must be on the same Nest as this BroodMother.
     * @param {function} asyncReturn - if you nest orders in this function you must return that value via this function in the order's callback.
     * @returns {boolean} True if the Spiderling was consumed. False otherwise.
     */
    consume: function(player, spiderling, asyncReturn) {
        // <<-- Creer-Merge: consume -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        var error = Spider._validate.call(this, player, false);
        if(error) {
            return error;
        }

        var reason;

        if(!Class.isInstance(spiderling, Spiderling)) {
            reason = "{this} cannot consume because '{spiderling}' is not a Spiderling.";
        }
        else if(spiderling.nest !== this.nest) {
            reason = "{this} cannot consume because '{spiderling}' is not on the same Nest as itself.";
        }
        else if(spiderling.isDead) {
            reason = "{this} cannot consume because'{spiderling}' is dead.";
        }

        if(reason) {
            return this.game.logicError(false, reason.format({
                this: this,
                spiderling,
            }));
        }

        // if we got here the consume is valid!

        spiderling.kill();
        this.eggs++;
        return true;

        // <<-- /Creer-Merge: consume -->>
    },

    /**
     * Spawns a new Spiderling on the same Nest as this BroodMother, consuming an egg.
     *
     * @param {Player} player - the player that called this.
     * @param {string} spiderlingType - The string name of the Spiderling class you want to Spawn. Must be 'Spitter', 'Weaver', or 'Cutter'.
     * @param {function} asyncReturn - if you nest orders in this function you must return that value via this function in the order's callback.
     * @returns {Spiderling} The newly spwaned Spiderling if successful. Null otherwise.
     */
    spawn: function(player, spiderlingType, asyncReturn) {
        // <<-- Creer-Merge: spawn -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        var error = Spider._validate.call(this, player, null);
        if(error) {
            return error;
        }

        var reason;

        var lowereSpiderlingType = spiderlingType.toLowerCase();
        if(!["cutter", "spitter", "weaver"].contains(lowereSpiderlingType)) {
            reason = "'{spiderlingType}' is not a valid Spiderling type to spawn.";
        }
        else if(this.eggs <= 0) {
            reason = "{this} does not have enough eggs to spawn a '{spiderlingType}'";
        }
        else if(this.owner.spiders.length - 1 === this.owner.maxSpiderlings) { // - 1 for the BroodMother that is not a Spiderling
            reason = "{this} can not spawn another Spiderling, maxSpiderlings reached ({this.owner.maxSpiderlings}).'";
        }

        if(reason) {
            return this.game.logicError(null, reason.format({
                this: this,
                spiderlingType,
            }));
        }

        // if we got here the spawn is valid!
        this.eggs -= 1;
        return this.game.create(lowereSpiderlingType.upcaseFirst(), {
            nest: this.nest,
            owner: this.owner,
        });

        // <<-- /Creer-Merge: spawn -->>
    },

    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    // You can add additional functions here. These functions will not be directly callable by client AIs

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = BroodMother;
