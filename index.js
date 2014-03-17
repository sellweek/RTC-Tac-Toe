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
	});

	var render = function() {
		$("#board").html(board({positions: model}));
	}

	var won = function() {

	}

	render();
});