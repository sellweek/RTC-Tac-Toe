"use strict"
$(function() {
	var model = [
		['', '', ''],
		['', '', ''],
		['', '', '']
	];

	var player = "X";

	var board = _.template($("#board-template").html());

	$("#board").on("click", "td", function(ev) {
		console.log("Clicked");
		var target = $(ev.target)
		model[target.parent().data("row")][target.data("col")] = player;
		render();
		if (won(model, player)) {
			alert("You won!");
		}
		$("#board").off("click", "td");
	});

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

	render();

	window.won = won;
});