// Spitter: A Spiderling that creates and spits new Webs from the Nest it is on to another Nest, connecting them.

var Class = require("classe");
var log = require(__basedir + "/gameplay/log");
var Spiderling = require("./spiderling");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between Creer re-runs

//<<-- /Creer-Merge: requires -->>

// @class Spitter: A Spiderling that creates and spits new Webs from the Nest it is on to another Nest, connecting them.
var Spitter = Class(Spiderling, {
    /**
     * Initializes Spitters.
     *
     * @param {Object} data - a simple mapping passsed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        Spiderling.init.apply(this, arguments);

        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this.spittingSpeed = 10;

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Spitter",


    /**
     * Creates and spits a new Web from the Nest the Spitter is on to another Nest, connecting them.
     *
     * @param {Player} player - the player that called this.
     * @param {Nest} nest - The Nest you want to spit a Web to, thus connecting that Nest and the one the Spitter is on.
     * @param {function} asyncReturn - if you nest orders in this function you must return that value via this function in the order's callback.
     * @returns {boolean} True if the spit was successful, false otherwise.
     */
    spit: function(player, nest, asyncReturn) {
        // <<-- Creer-Merge: spit -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        var error = Spiderling._validate.call(this, player, false);
        if(error) {
            return error;
        }

        var reason;
        if(!nest) {
            reason = "'{nest}' is not a Nest for {this} to spit at.";
        }
        else if(nest === this.nest) {
            reason = "{this} cannot spit at the same Nest it is on ({nest}).";
        }

        if(reason) {
            return this.game.logicError(false, reason.format({
                this: this,
                nest: nest,
            }));
        }

        for(var i = 0; i < nest.webs.length; i++) {
            var web = nest.webs[i];
            if(web.isConnectedTo(this.nest, nest)) {
                return this.game.logicError(false, "{this} cannot spit a new Web from {this.nest} to {nest} because {web} already exists.".format({
                    this: this,
                    nest: nest,
                    web: web,
                }));
            }
        }

        // if we got here, then everything should be ok for the spit to start

        this.busy = "Spitting";
        this.spittingWebToNest = nest;

        // find coworkers
        var sideSpiders = this.nest.spiders.concat(nest.spiders);
        for(i = 0; i < sideSpiders.length; i++) {
            var spider = sideSpiders[i];
            if(spider !== this && (spider.spittingWebToNest === nest || spider.spittingWebToNest === this.nest)) {
                this.coworkers.push(spider);
                this.numberOfCoworkers = this.coworkers.length;
                spider.coworkers.push(this);
                spider.numberOfCoworkers = spider.coworkers.length;
            }
        }

        this.workRemaining = this.nest.distanceTo(nest) / this.game.spitSpeed;

        this.game.csHack();

        return true;

        // <<-- /Creer-Merge: spit -->>
    },

    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    /**
     * Kills the Spitter
     *
     * @override
     */
    kill: function() {
        Spiderling.kill.apply(this, arguments);

        this.spittingWebToNest = null;
    },

     /**
     * Finishes the actions of the Spitter
     *
     * @override
     * @param {boolean} forceFinish - true if forcing the finish prematurely
     */
    finish: function(forceFinish) {
        if(Spiderling.finish.apply(this, arguments)) {
            return; // because they finished moving or something the base Spiderling class can handle
        }

        if(forceFinish) {
            this.spittingWebToNest = null;
            return;
        }

        // if we got here they finished spitting
        var newWeb = this.game.create("Web", {
            nestA: this.nest,
            nestB: this.spittingWebToNest,
        });

        // cancel spitters on the current nest to the destination
        var sideSpiders = newWeb.getSideSpiders();
        for(var i = 0; i < sideSpiders.length; i++) {
            var spider = sideSpiders[i];
            if(spider !== this && (spider.spittingWebToNest === this.spittingWebToNest || spider.spittingWebToNest === this.nest)) {
                spider.finish(true);
            }
        }

        this.spittingWebToNest = null;
    },

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Spitter;
