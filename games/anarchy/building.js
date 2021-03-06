// Building: A basic building. It does nothing besides burn down. Other Buildings inherit from this class.

var Class = require("classe");
var log = require(__basedir + "/gameplay/log");
var GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between cree runs
//<<-- /Creer-Merge: requires -->>

// @class Building: A basic building. It does nothing besides burn down. Other Buildings inherit from this class.
var Building = Class(GameObject, {
    /**
     * Initializes Buildings.
     *
     * @param {Object} data - a simple mapping passsed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        GameObject.init.apply(this, arguments);

        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this.health = this.maxHealth;

        if(this.isHeadquarters) {
            this.makeHeadquarters();
        }

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Building",


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    maxHealth: 100,

    /**
     * does the basic checking that all buildings must meet for valid bribes
     *
     * @param {Player} player - the player trying to bribe this building
     * @param {*} errorValue - the error value to store in the game logic error
     * @returns {Object|undefined} a game logic error is returned if the bribe is NOT valid, undefined otherwise
     */
    _checkIfBribeIsValid: function(player, errorValue) {
        var reason;
        if(this.owner !== player) {
            reason = "Player {{{player.id}}} cannot bribe this Building {{{self.id}}} owned by Player {{{self.owner.id}}}.";
        }
        else if(player.bribesRemaining <= 0) {
            reason = "Player {{{player.id}}} has no bribes remaining to bribe Building {{{self.id}}} with.";
        }
        else if(this.health <= 0) {
            reason = "Building {{{self.id}}} has been burned down and cannot be bribed.";
        }
        else if(this.bribed) {
            reason = "Building {{{self.id}}} has already been bribed this turn and cannot be bribed again.";
        }

        if(reason) {
            return this.game.logicError(errorValue, reason.format({
                self: this,
                player: player,
            }));
        }
    },

    /**
     * sets this building as the headquarters for its owner. This should only be called once per player, and only during game initialization
     */
    makeHeadquarters: function() {
        this.isHeadquarters = true;
        this.owner.headquarters = this;
        this.health *= this.game.headquartersHealthScalar;
    },

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Building;
