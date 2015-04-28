var Class = require("../utilities/class");
var constants = require("../constants");
var serializer = require("../utilities/serializer");
var moment = require('moment');

// @class BaseGame: the base game plugin new games should inherit from.
var BaseGame = Class({
	init: function(data) {
		// serializable member variables
		this.players = [];
		this.gameObjects = {};
		this.session = (data.session === undefined ? "Unknown" : data.session);
		this.name = "Base Game"; // should be overwritten by the GeneratedGame inheriting this

		this._deltas = []; // record of all delta states, for the game log generation
		this._currentRequests = []; // array of current requests
		this._started = false;
		this._over = false;
		this._nextGameObjectID = 0;
		this._lastSerializableState = null;
		this._currentSerializableState = null;
		this._serializableDeltaState = null;

		this._serializableKeys = {
			"players": true,
			"currentPlayers": true,
			"gameObjects": true,
			"session": true,
			"name": true,
		};
	},

	// @static - because that way this exicsts without making a new instance
	numberOfPlayers: 2,



	/////////////////////////////
	// Server starting methods //
	/////////////////////////////

	/// Do not inherit this method, instead use begin()
	// @param players {Array<Client>} of clients that are playing this game as a player
	start: function(clients) {
		this._initPlayers(clients);

		this.begin();

		this._updateSerializableStates();
		this._started = true;
	},

	// @returns boolean representing if the game has started yet.
	hasStarted: function() {
		return this._started;
	},

	// @inheritable: intended to be inherited and extended when the game should be started (e.g. initializing game objects)
	begin: function() {
		// This should be inheritied in <gamename>/game.js. This function is simply here in case they delete the function because they don't need it (no idea why that would be the case though).
	},



	/////////////
	// Players //
	/////////////

	_initPlayers: function(clients) {
		for(var i = 0; i < clients.length; i++) {
			var client = clients[i];
			var player = this.newPlayer({ // this method should be implimented in GeneratedGame
				name: client.name || ("Player " + i),
				clientType: client.type || "Unknown",
			});

			player.timeRemaining = player.timeRemaining || 10000; // 10 seconds (10,000ms)
			player.client = client;
			client.setPlayer(player);
			this.players.push(player);
		}
	},

	/// remove the client from the game and checks if they have a player and if removing them alters the game
	playerDisconnected: function(player) {
		if(player) {
			if(this.hasStarted() && !this.isOver()) {
				this.declairLoser(player, "Disconnected during gameplay.");
			}
		}
	},



	//////////////////
	// Game Objects //
	//////////////////

	// @returns BaseGameObject with the given id
	getGameObject: function(id) { // TO INHERIT
		id = parseInt(id);
		if(id !== NaN) {
			return this.gameObjects[id];
		}
	},

	// @returns boolean representing if the passed in obj is a tracked game object in this game
	isGameObject: function(obj) {
		return (serializer.isObject(obj) && obj.id !== undefined && this.getGameObject(obj.id) === obj);
	},

	_generateNextGameObjectID: function() {
		return String(this._nextGameObjectID++); // returns this._nextGameObjectID then increments by 1 (that's how post++ works FYI)
	},

	/// tracks the game object, should be called via BaseGameObjects during their initialization
	// @returns int thier id
	trackGameObject: function(gameObject) {
		gameObject.id = this._generateNextGameObjectID()
		this.gameObjects[gameObject.id] = gameObject;
		return gameObject.id;
	},



	/////////////////////////////////
	// Client Responses & Requests //
	/////////////////////////////////

	handleResponse: function(player, response, data) {
		var callback = this["handle" + response.capitalize()];

		if(callback) {
			return callback.call(this, player, data);
		}
		else {
			console.error("game could not handle response", response, data);
		}
	},

	/// executes a command for a player via reflection, which should alter the game state. This is the default response type by players
	// @param <Player> player that wants to execute the command
	// @param <object> data: formatted command data that must include the caller.id and command string reprenting a function on the caller to execute. Any other keys are variables for that function.
	// @returns boolean representing if the command was executed successfully (players can send invalid data, it's up to the game logic being called to decide if it was valid here)
	executeCommandFor: function(player, data) {
		var success = false;
		if(data && data._caller && data._command) {
			var commandFunction = data._caller["command_" + data._command];

			if(commandFunction) {
				success = commandFunction.call(data._caller, player, data);
				this._updateSerializableStates();
			}
			else {
				console.error("No command", data.command, "in", gameObject.gameObjectName);
			}
		}

		return Boolean(success);
	},

	addRequest: function(player, request, args) {
		this._currentRequests.push({
			player: player,
			request: request,
			args: args || [],
		});
	},

	popRequests: function() {
		var requests = this._currentRequests.clone();
		this._currentRequests.empty();
		return requests;
	},



	///////////////////////////
	// States & Delta States //
	///////////////////////////

	/// returns the difference between the last and current state for the given player
	// @param <Player> player: for inheritance if the state differs between players
	getSerializableDeltaStateFor: function(player) {
		return this._serializableDeltaState;
	},

	/// updates all the private states used to generate delta states and game logs
	_updateSerializableStates: function() {
		this.hasStateChanged = true; // for the server to see
		this._lastSerializableState = this._currentSerializableState || {};
		this._currentSerializableState = serializer.serialize(this);
		this._serializableDeltaState = serializer.getDelta(this._lastSerializableState, this._currentSerializableState) || {};

		this._deltas.push(this._serializableDeltaState);
	},

	generateGamelog: function() {
		var m = moment();
		return {
			gameName: (this.name !== undefined ? this.name : "UNKNOWN_GAME"),
			gameSession: (this.session !== undefined ? this.session : "UNKNOWN_SESSION"),
			deltas: this._deltas,
			epoch: m.valueOf(),
		};
	},



	/////////////////////////
	// Winning and Loosing //
	/////////////////////////

	/// @returns boolean representing if this game is over
	isOver: function(isOver) {
		if(isOver) {
			this._over = true;
		}

		return this._over;
	},

	/// declairs a player as having lost, and assumes when a player looses the rest could still be competing to win
	// @param <Player> loser: player that lost the game
	// @param <string> reason (optional): string that is the lose reason
	// @param <object> flags (optional): 'dontCheckForWinner' key to set to not check for winner
	declairLoser: function(loser, reason, flags) {
		loser.lost = true;
		loser.reasonLost = reason || "Lost";
		loser.won = false;
		loser.reasonWon = "";

		if(!flags || !flags.dontCheckForWinner) {
			this.checkForWinner();
		}

		return false;
	},

	/// declairs the player as winning, assumes when a player wins the rest lose (unless they've already been set to win)
	// @param <Player> winner: player that won the game, the rest loose if not already won
	// @param <string> reason (optional): the win reason string
	declairWinner: function(winner, reason) {
		winner.won = true;
		winner.reasonWon = reason || "Won";
		winner.lost = false;
		winner.reasonLost = "";

		for(var i = 0; i < this.players.length; i++) {
			var player = this.players[i];

			if(player !== winner && !player.won && !player.lost) { // then this player has not lost yet and now looses because someone else won
				this.declairLoser(player, "Other player won", {dontCheckForWinner: true});
			}
		}

		this.isOver(true);
		return true;
	},

	/// checks if this game is over because there is a winner (all other players have lost)
	checkForWinner: function() {
		var winner;
		for(var i = 0; i < this.players.length; i++) {
			var player = this.players[i];

			if(!player.lost) {
				if(winner) {
					return false;
				}
				else {
					winner = player;
				}
			}
		}

		if(winner) {
			return this.declairWinner(winner, "All other players lost.");
		}
		return false;
	},
});

module.exports = BaseGame
