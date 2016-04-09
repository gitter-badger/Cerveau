// Generated by Creer at 05:17PM on April 08, 2016 UTC, git hash: 'e7ec4e35c89d7556b9e07d4331ac34052ac011bd'

var Class = require(__basedir + "/utilities/class");
var serializer = require(__basedir + "/gameplay/serializer");
var log = require(__basedir + "/gameplay/log");
var Spider = require("./spider");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between Creer re-runs

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

        /**
         * When empty string this Spiderling is not busy, and can act. Otherwise a string representing what it is busy with, e.g. 'Moving', 'Attacking'.
         *
         * @type {string}
         */
        this._addProperty("busy", serializer.defaultString(data.busy));

        /**
         * How much damage this Spiderling does to the BroodMother.
         *
         * @type {number}
         */
        this._addProperty("damage", serializer.defaultInteger(data.damage));

        /**
         * The Web this Spiderling is using to move. Null if it is not moving.
         *
         * @type {Web}
         */
        this._addProperty("movingOnWeb", serializer.defaultGameObject(data.movingOnWeb));

        /**
         * The Nest this Spiderling is moving to. Null if it is not moving.
         *
         * @type {Nest}
         */
        this._addProperty("movingToNest", serializer.defaultGameObject(data.movingToNest));

        /**
         * How much distance this Spiderling covers per turn when moving across Webs.
         *
         * @type {number}
         */
        this._addProperty("speed", serializer.defaultNumber(data.speed));

        /**
         * The number of turns remaining for this Spiderling's current task.
         *
         * @type {number}
         */
        this._addProperty("turnsRemaining", serializer.defaultInteger(data.turnsRemaining));

        /**
         * How heavy this spider is. Webs it moves across must have enough strength to support it in addition to existing Spiderlings.
         *
         * @type {number}
         */
        this._addProperty("weight", serializer.defaultInteger(data.weight));


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // put any initialization logic here. the base variables should be set from 'data' above

        this.speed = 1;
        this.cost = 1;

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

        if(!Class.isInstance(spiderling, Spiderling)) {
            reason = "{this} cannot attack because '{spiderling}' is not a Spiderling.";
        }
        else if(spiderling.nest !== this.nest) {
            reason = "{this} cannot attack because '{spiderling}' is not on the same Nest as itself.";
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

        if(!web) {
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
        this.turnsRemaining = Math.ceil(web.length / this.speed);

        this.movingOnWeb = web;
        this.movingToNest = web.getOtherNest(this.nest);

        this.nest.spiders.removeElement(this);
        this.nest = null;

        web.spiderlings.push(this);
        web.addLoad(this.weight);

        return true;

        // <<-- /Creer-Merge: move -->>
    },

    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    /**
     * @override
     */
    kill: function() {
        Spider.kill.apply(this, arguments);

        this.busy = "";
        this.turnsRemaining = -1;
        this.movingToNest = null;

        if(this.movingOnWeb) {
            this.movingOnWeb.spiderlings.removeElement(this);
            this.movingOnWeb = null;
        }
    },

    /**
     * @override
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
     * @override
     */
    finish: function() {
        this.busy = "";

        if(!this.movingOnWeb) {
            return false;
        }

        // if we got here they finished moving on a web
        this.nest = this.movingToNest;
        this.movingToNest = null;
        this.movingOnWeb = null;
        this.web.addLoad(-this.weight);

        var enemyBroodMother = this.owner.otherPlayer.broodMother;
        if(this.nest === enemyBroodMother.nest) { // then we reached the enemy's BroodMother! Kamikaze into her!
            enemyBroodMother.heath = Math.max(enemyBroodMother.health - this.damage, 0);
            this.kill();
        }

        return true;
    },

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Spiderling;
