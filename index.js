"use strict"
$(function() {

	var player, opponent;
	var connection;

	var init = function() {
		var peer = new Peer({key: "9e8yliywalymbo6r", debug: 3, config: {'iceServers': [{ url: 'stun:stun01.sipphone.com' }]}});
		peer.on("open", function() {
			$("#my-id").val(peer.id);
		});
		peer.on("connection", function(conn) {
			connection = conn;
			$("#id-block").remove();
			connection.on("error", function(err) {
				alert("Error ocurred, check console!");
				console.log(err);
			});
			connection.on("data", handler);
			player = "O";
			opponent = "X";
			render();
			disable();
		});
		$("#connect").on("click", function() {
			connection = peer.connect($("#foreign-id").val(), {serialization: "json"});
			$("#id-block").remove();
			connection.on("error", function(err) {
				alert("Error ocurred, check console!");
				console.log(err);
			});
			connection.on("data", handler);
			connection.on("open", function() {
				player = "X";
				opponent = "O";
				render();
				enable();
			});
		});
		/*
		master = false;
		if (master) {
			player = 'X';
			opponent = 'O';
			key = "master";
		} else {
			player = 'O';
			opponent = 'X';
			key = "slave";
		}
		if (master) {
			peer.on("connection", function(conn) {
				alert("Slave has connected");
				conn.on("error", function(err) {
					alert("Error ocurred, check console!");
					console.log(err);
				});
				connection = conn;
				render();
				disable();
				connection.on("data", handler);
			})
		} else {
			peer.on("open", function() {
				connection = peer.connect("master");
				connection.on("error", function(err) {
					alert("Error ocurred, check console!");
					console.log(err);
				});
				connection.on("data", handler);
				connection.on("open", function() {
					alert("You are connected");
					render();
					enable();
				});
			});
		}*/
	}

	var handler = function(data) {
		model[data.row][data.col] = opponent;
		render();
		if (won(model, opponent)) {
			alert("Your opponent has won!");
			return;
		}
		enable();
	}

	var model = [
		['', '', ''],
		['', '', ''],
		['', '', '']
	];

	var board = _.template($("#board-template").html());

	var enable = function() {
		$("#board").on("click", "td", function(ev) {
			console.log("Clicked");
			var target = $(ev.target)
			var row = target.parent().data("row");
			var col = target.data("col");
			model[row][col] = player;
			render();
			connection.send({
				row: row,
				col: col
			});
			if (won(model, player)) {
				alert("You won!");
			}
			disable();
		});
	}

	var disable = function() {
		$("#board").off("click", "td");
	}

	var render = function() {
		$("#board").html(board({positions: model}));
	}

	var won = function(board, player) {
		var vertical = [[0, 0], [0, 1], [0, 2]];
		var horizontal = [[0, 0], [1, 0], [2, 0]];

		for (var i = 0; i < vertical.length; i++) {
			var pos = vertical[i];
			var result = (board[pos[0]][pos[1]] == player) && (board[pos[0]+1][pos[1]] == player) && (board[pos[0]+2][pos[1]] == player);
			if (result) {
				return true;
			}
		}

		for (var i = 0; i < horizontal.length; i++) {
			var pos = horizontal[i];
			var result = (board[pos[0]][pos[1]] == player) && (board[pos[0]][pos[1] + 1] == player) && (board[pos[0]][pos[1] + 2] == player);
			if (result) {
				return true;
			}
		}

		var result = (board[0][0] == player) && (board[1][1] == player) && (board[2][2] == player);
		if (result) {
			return true;
		}
		result = (board[0][2] == player) && (board[1][1] == player) && (board[2][0] == player);
		if (result) {
			return true;
		}

		return false;
	}
	init();
});