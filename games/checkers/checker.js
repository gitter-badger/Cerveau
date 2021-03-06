// Checker: A checker on the game board.

var Class = require("classe");
var log = require(__basedir + "/gameplay/log");
var GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
// any additional requires you want can be required here safely between cree runs
//<<-- /Creer-Merge: requires -->>

// @class Checker: A checker on the game board.
var Checker = Class(GameObject, {
    /**
     * Initializes Checkers.
     *
     * @param {Object} data - a simple mapping passsed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        GameObject.init.apply(this, arguments);

        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // put any initialization logic here. the base variables should be set from 'data' in Generated${obj_key}'s init function
        // NOTE: no players are connected at this point.
        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Checker",


    /**
     * Returns if the checker is owned by your player or not.
     *
     * @param {Player} player - the player that called this.
     * @param {function} asyncReturn - if you nest orders in this function you must return that value via this function in the order's callback.
     * @returns {boolean} True if it is yours, false if it is not yours.
     */
    isMine: function(player, asyncReturn) {
        // <<-- Creer-Merge: isMine -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        return (player === this.owner);
        // <<-- /Creer-Merge: isMine -->>
    },

    /**
     * Moves the checker from its current location to the given (x, y).
     *
     * @param {Player} player - the player that called this.
     * @param {number} x - The x coordinate to move to.
     * @param {number} y - The y coordinate to move to.
     * @param {function} asyncReturn - if you nest orders in this function you must return that value via this function in the order's callback.
     * @returns {Checker} Returns the same checker that moved if the move was successful. null otherwise.
     */
    move: function(player, x, y, asyncReturn) {
        // <<-- Creer-Merge: move -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        var game = this.game;
        if(this.owner !== player) {
            return game.logicError(null, "tried to move a checker they didn't own");
        }

        if(game.checkerMoved) {
            if(game.checkerMoved !== this) {
                return game.logicError(null, "tried to move a diferent checker than the already moved one");
            }
            else if(!game.checkerMovedJumped) {
                return game.logicError(null, "tried to move again after not jumping another checker.");
            }
        }

        if(game.getCheckerAt(x, y)) {
            return game.logicError(null, "tried to move onto another checker");
        }

        var yOffset = this.owner.yDirection;
        var yKing = (yOffset === 1 ? (game.boardHeight - 1) : 0);

        var dy = y - this.y;
        var dx = x - this.x;

        var fromString = "(" + this.x + ", " + this.y + ") -> (" + x + ", " + y + ")";
        if(!this.kinged) { // then check if they are moving the right direction via dy when not kinged
            if((yOffset === 1 && dy < 1) || (yOffset === -1 && dy > -1)) {
                return game.logicError(null, "moved in the wrong vertical direction " + fromString);
            }
        }

        var jumped;
        if(Math.abs(dx) === 2 && Math.abs(dy) === 2) { // then it's jumping something
            jumped = game.getCheckerAt(this.x + dx/2, this.y + dy/2);

            if(!jumped) {
                return game.logicError(null, "tried to jump nothing " + fromString);
            }
            else if(jumped.owner.id === this.owner.id) {
                return game.logicError(null, "tried to jump own checker " + fromString);
            }
        }
        else if(Math.abs(dx) === 1 && Math.abs(dy) === 1) { // then they are just moving 1 tile diagonally
            if(game.checkerMovedJumped) {
                return game.logicError(null, "current checker must jump again, not move diagonally one tile " + fromString);
            }
            // else valid as normal move
        }
        else {
            return game.logicError(null, "can't move there " + fromString);
        }

        // if we got here all the checks passed! the checker moves

        this.x = x;
        this.y = y;

        if(this.y === yKing) {
            this.kinged = true;
        }

        if(!game.checkerMoved) {
            game.checkerMoved = this;
        }

        if(jumped) {
            if(jumped.owner !== this.owner) {
                game.checkers.removeElement(jumped);
                jumped.owner.checkers.removeElement(jumped);

                this.game.order(jumped.owner, "gotCaptured", {
                    checker: jumped,
                }); // tell the owner's AI that their jumped checker was captured

                // we need to check if the owner won because they just jumped all the other checkers
                var checkersOwnerWon = true;
                for(var i = 0; i < game.checkers.length; i++) {
                    if(this.owner !== game.checkers[i].owner) {
                        checkersOwnerWon = false;
                        break;
                    }
                }

                if(checkersOwnerWon) {
                    game.declareLoser(this.game.getOtherPlayers(this.owner)[0], "No checkers remaining", { dontCheckForWinner: true });
                    game.declareWinner(this.owner, "All enemy checkers jumped");
                }
            }

            game.checkerMovedJumped = true;
        }

        return this;
        // <<-- /Creer-Merge: move -->>
    },

    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    // You can add additional functions here. These functions will not be directly callable by client AIs
    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Checker;
