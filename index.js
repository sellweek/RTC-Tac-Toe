"use strict"
$(function() {

	var player, opponent;
	var connection;

	var init = function() {
		var peer = new Peer({key: "9e8yliywalymbo6r", debug: 3, config: {'iceServers': [{ url: 'stun:stun.ekiga.net' }]}});
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
			$("#status").show();
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
				$("#status").show();
				enable();
			});
		});
	}

	var handler = function(data) {
		model[data.row][data.col] = opponent;
		render();
		if (won(model, opponent)) {
			$("#status").text("Your opponent has won!");
			return;
		}
		enable();
	}

	var model = [
		['', '', ''],
		['', '', ''],
		['', '', '']
	];

	var enable = function() {
		$("#status").text("It's your turn.");
		$("#board").on("click", "td", function(ev) {
			var target = $(ev.target)
			var row = target.parent().data("row");
			var col = target.data("col");
			if (model[row][col] == "") {
				model[row][col] = player;
				render();
				connection.send({
					row: row,
					col: col
				});
				disable();
				if (won(model, player)) {
					$("#status").text("You have won!");
				}
			}
		});
	}

	var disable = function() {
		$("#status").text("It's your opponent's turn.");
		$("#board").off("click", "td");
	}

	var board = _.template($("#board-template").html());
	var square = _.template($("#square-template").html());

	var render = function() {
		$("#board").html(board({positions: model, square: square}));
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