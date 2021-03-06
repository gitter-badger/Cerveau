// Spiderling: A Spider spawned by the BroodMother.

var Class = require("classe");
var log = require(__basedir + "/gameplay/log");
var Spider = require("./spider");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

var Web = require("./web");

//<<-- /Creer-Merge: requires -->>

// @class Spiderling: A Spider spawned by the BroodMother.
var Spiderling = Class(Spider, {
    /**
     * Initializes Spiderlings.
     *
     * @param {Object} data - a simple mapping passsed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        Spider.init.apply(this, arguments);

        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this.coworkers = [];

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Spiderling",


    /**
     * Attacks another Spiderling
     *
     * @param {Player} player - the player that called this.
     * @param {Spiderling} spiderling - The Spiderling to attack.
     * @param {function} asyncReturn - if you nest orders in this function you must return that value via this function in the order's callback.
     * @returns {boolean} True if the attack was successful, false otherwise.
     */
    attack: function(player, spiderling, asyncReturn) {
        // <<-- Creer-Merge: attack -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // Developer: Put your game logic for the Spiderling's attack function here

        var error = Spiderling._validate.call(this, player, false);
        if(error) {
            return error;
        }

        var reason;

        if(!Spiderling.isInstance(spiderling)) {
            reason = "{this} cannot attack because '{spiderling}' is not a Spiderling.";
        }
        else if(spiderling.nest !== this.nest) {
            reason = "{this} cannot attack because '{spiderling}' is not on the same Nest as itself.";
        }
        else if(this === Spiderling) {
            reason = "{this} cannot attack itself.";
        }
        else if(spiderling.isDead) {
            reason = "{this} cannot attack because'{spiderling}' is dead.";
        }

        if(reason) {
            return this.game.logicError(false, reason.format({
                this: this,
                spiderling,
            }));
        }

        // if we got here the attack is valid!

        // Rock Paper Scissors
        // Cutter > Weaver > Spitter > Cutter
        // Ties, both die

        if(this.gameObjectName === spiderling.gameObjectName) { // they are the same type, so
            this.kill();
            spiderling.kill();
        }

        if(
            (this.gameObjectName === "Cutter" && spiderling.gameObjectName === "Weaver") ||
            (this.gameObjectName === "Weaver" && spiderling.gameObjectName === "Spitter") ||
            (this.gameObjectName === "Spitter" && spiderling.gameObjectName === "Cutter")
        ) {
            spiderling.kill();
        }

        if(
            (spiderling.gameObjectName === "Cutter" && this.gameObjectName === "Weaver") ||
            (spiderling.gameObjectName === "Weaver" && this.gameObjectName === "Spitter") ||
            (spiderling.gameObjectName === "Spitter" && this.gameObjectName === "Cutter")
        ) {
            this.kill();
        }

        if(!this.isDead) {
            this.busy = "Attacking"; // so they cannot attack again
            this.workRemaining = 1;
        }

        this.game.csHack();

        return true;

        // <<-- /Creer-Merge: attack -->>
    },

    /**
     * Starts moving the Spiderling across a Web to another Nest.
     *
     * @param {Player} player - the player that called this.
     * @param {Web} web - The Web you want to move across to the other Nest.
     * @param {function} asyncReturn - if you nest orders in this function you must return that value via this function in the order's callback.
     * @returns {boolean} True if the move was successful, false otherwise.
     */
    move: function(player, web, asyncReturn) {
        // <<-- Creer-Merge: move -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        var error = Spiderling._validate.call(this, player, false);
        if(error) {
            return error;
        }

        var reason;

        if(!web || !Web.isInstance(web)) {
            reason = "{web} is not a Web for {this} to move on.";
        }
        else if(!web.isConnectedTo(this.nest)) {
            reason = "{web} is not connected to {this.nest} for {this} to move on.";
        }

        if(reason) {
            return this.game.logicError(false, reason.format({
                this: this,
                web: web,
            }));
        }

        // if we got here the move is valid

        this.busy = "Moving";
        this.workRemaining = Math.ceil(web.length / this.game.movementSpeed);

        this.movingOnWeb = web;
        this.movingToNest = web.getOtherNest(this.nest);

        this.nest.spiders.removeElement(this);
        this.nest = null;

        web.spiderlings.push(this);
        web.addLoad(1);

        this.game.csHack();

        return true;

        // <<-- /Creer-Merge: move -->>
    },

    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    /**
     * Kills the Spiderling
     *
     * @override
     */
    kill: function() {
        Spider.kill.apply(this, arguments);

        this.busy = "";
        this.workRemaining = -1;
        this.movingToNest = null;

        for(var i = 0; i < this.coworkers.length; i++) {
            var coworker = this.coworkers[i];
            coworker.coworkers.removeElement(this);
            coworker.numberOfCoworkers = coworker.coworkers.length;
        }

        this.coworkers.length = 0;
        this.numberOfCoworkers = this.coworkers.length;

        if(this.movingOnWeb) {
            this.movingOnWeb.spiderlings.removeElement(this);
            this.movingOnWeb = null;
        }
    },

    /**
     * Validates that this spiderling is not busy
     *
     * @override
     * @param {Player} player - the player validating for
     * @param {*} invalidReturnValue - if an error is returned, this is the inavalid return value sent to the client
     * @returns {Cerveau.GameLogicError} an error is returned if invalid, undefined otherwise
     */
    _validate: function(player, invalidReturnValue) {
        var error = Spider._validate.apply(this, arguments);
        if(error) {
            return error;
        }

        if(this.busy) {
            return this.game.logicError(invalidReturnValue, "{this} is already busy with '{this.busy}'.".format({
                this: this,
            }));
        }
    },

    /**
     * Tells the Spiderling to finish what it is doing (moving, cutting, spitting, weaving)
     *   Note: coworkers are finished in the Game class, not here
     *
     * @param {boolean} forceFinish - True if the task was not finished by THIS spiderling
     * @returns {boolean} true if finished, false otherwise
     */
    finish: function(forceFinish) {
        var finishing = this.busy;
        this.busy = "";
        this.workRemaining = 0;

        if(finishing === "Moving") {
            this.nest = this.movingToNest;
            this.nest.spiders.push(this);
            this.movingOnWeb.spiderlings.removeElement(this);
            this.movingOnWeb.addLoad(-1);
            this.movingToNest = null;
            this.movingOnWeb = null;

            var enemyBroodMother = this.owner.otherPlayer.broodMother;
            if(this.nest === enemyBroodMother.nest) { // then we reached the enemy's BroodMother! Kamikaze into her!
                enemyBroodMother.health = Math.max(enemyBroodMother.health - 1, 0);
                if(enemyBroodMother.health === 0) {
                    enemyBroodMother.isDead = true;
                }
                this.kill();
            }

            return true;
        }
        else if(finishing === "Attacking") {
            return true;
        }
        else { // they finished doing a different action (cut, weave, spit)
            this.coworkers.length = 0;
            this.numberOfCoworkers = this.coworkers.length;
            return false;
        }
    },

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Spiderling;
