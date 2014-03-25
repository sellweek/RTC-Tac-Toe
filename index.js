"use strict"
$(function() {

	var player, opponent;
	var connection;

	var model = [
		['', '', ''],
		['', '', ''],
		['', '', '']
	];

	var init = function() {
		var peer = new Peer({key: "9e8yliywalymbo6r", config: {'iceServers': [{ url: 'stun:stun.ekiga.net' }]}});
		peer.on("open", function() {
			$("#my-id").text(peer.id);
			$("input:disabled").removeAttr("disabled");
		});
		peer.on("connection", function(conn) {
			connection = conn;
			$("#id-block").remove();
			$("#status-row").css("display", "table");
			connection.on("error", errHandler);
			connection.on("close", disconnectHandler);
			connection.on("data", dataHandler);
			$("#reset").on("click", resetHandler);
			player = "O";
			opponent = "X";
			render();
			disable();
		});
		$("#connect").on("click", function() {
			connection = peer.connect($("#foreign-id").val(), {serialization: "json"});
			$("#id-block").remove();
			$("#status-row").css("display", "table");
			$("#reset").hide();
			$("#status").text("Connecting to opponent.");
			connection.on("error", errHandler);
			connection.on("data", dataHandler);
			connection.on("open", function() {
				$("#reset").show();
				player = "X";
				opponent = "O";
				render();
				enable();
			});
			connection.on("close", disconnectHandler);
			$("#reset").on("click", resetHandler);
		});
	}

	var dataHandler = function(data) {
		$("#reset").off("click");
		$("#reset").on("click", resetHandler);
		if (data.row == -1 && data.col == -1) {
			var approved = confirm("Your opponent wants to reset the game. Do you?");
			if (approved) {
				model = [
					['', '', ''],
					['', '', ''],
					['', '', '']
				];
				connection.send({
					row: -2,
					col: -2
				});
				render();
				disable();
			}
		} else if (data.row == -2 && data.col == -2) {
			model = [
					['', '', ''],
					['', '', ''],
					['', '', '']
				];
				render();
				enable();
		} else {
			model[data.row][data.col] = opponent;
			render();
			if (won(model, opponent)) {
				$("#status").text("Your opponent has won!");
				return;
			}
			enable();
		}
	}

	var disconnectHandler = function() {
		disable();
		$("#status").text("Your opponent has left.")
	}

	var errHandler = function(err) {
		alert("Error ocurred, check console!");
		console.log(err);
	}

	var resetHandler = function() {
		connection.send({
			row: -1,
			col: -1
		});
		disable();
		$("status").text("Waiting for opponent approval.");
		$("#reset").off("click");
	}

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