import { Container, Graphics, Text, autoDetectRenderer } from "pixi.js";

// EVENT LISTENERS
var keys = {
	w: false,
	s: false,
	up: false,
	down: false,
	paddle1: false,
	paddle2: false
};
window.addEventListener("keydown", function(e) {
	switch (e.keyCode) {
		case 87:
			keys.w = true;
			e.preventDefault();
			break;
		case 83:
			keys.s = true;
			e.preventDefault();
			break;
		case 38:
			keys.up = true;
			e.preventDefault();
			break;
		case 40:
			keys.down = true;
			e.preventDefault();
			break;
	}
});

window.addEventListener("keyup", function(e) {
	switch (e.keyCode) {
		case 87:
			keys.w = false;
			e.preventDefault();
			break;
		case 83:
			keys.s = false;
			e.preventDefault();
			break;
		case 38:
			keys.up = false;
			e.preventDefault();
			break;
		case 40:
			keys.down = false;
			e.preventDefault();
			break;
	}
});

// INTERSECTIONS
function paddleIntersects(paddle) {
	return !(
		(ball.x - radius()) > (paddle.x + paddleWidth()) || 
		(paddle.x) > (ball.x + radius()) || 
		(ball.y - radius()) > (paddle.y + paddleHeight()) ||
		(paddle.y) > (ball.y + radius())
		);
}

// CONTAINER
var container = new Container();

var width = 160;
var height = 90;


// PADDLES
var border = function() {
	// return Math.round(width / 80);
	return 0;
}
var paddleWidth = function() {
	return Math.round(width / 80);
}
var paddleHeight = function() {
	return Math.round(height / 5);
}
var paddleSpeed = function() {
	return paddleHeight() / 8;
}
var paddle1 = new Graphics();
paddle1.beginFill(0x000000);
paddle1.drawRect(0, 0, paddleWidth(), paddleHeight());
paddle1.endFill();
paddle1.position.y = height / 2 - paddleHeight() / 2;

var paddle2 = new Graphics();
paddle2.beginFill(0x000000);
paddle2.drawRect(0, 0, paddleWidth(), paddleHeight());
paddle2.endFill();
paddle2.position.y = height / 2 - paddleHeight() / 2;

container.addChild(paddle1);
container.addChild(paddle2);

function snapPaddles() {
	paddle1.position.y = Math.min(height - border() - paddleHeight(), Math.max(border(), paddle1.position.y));
	paddle2.position.y = Math.min(height - border() - paddleHeight(), Math.max(border(), paddle2.position.y));
}

// INTERACTIVE
paddle1.interactive = true;
paddle2.interactive = true;
paddle1.buttonMode = true;
paddle2.buttonMode = true;

paddle1
	.on('mousedown', onDragStart)
	.on('touchstart', onDragStart)
	.on('mouseup', onDragEnd)
	.on('mouseupoutside', onDragEnd)
	.on('touchend', onDragEnd)
	.on('touchendoutside', onDragEnd)
	.on('mousemove', onDragMove)
	.on('touchmove', onDragMove);
paddle2
	.on('mousedown', onDragStart)
	.on('touchstart', onDragStart)
	.on('mouseup', onDragEnd)
	.on('mouseupoutside', onDragEnd)
	.on('touchend', onDragEnd)
	.on('touchendoutside', onDragEnd)
	.on('mousemove', onDragMove)
	.on('touchmove', onDragMove);

function onDragStart(event) {
	if (this === paddle1) {
		keys.paddle1 = true;
	}
	else if (this === paddle2) {
		keys.paddle2 = true;
	}
	this.data = event.data;
	this.dragging = true;
	this.sy = this.data.getLocalPosition(this).y;
}
function onDragEnd(event) {
	if (this === paddle1) {
		keys.paddle1 = false;
	}
	else if (this === paddle2) {
		keys.paddle2 = false;
	}
	this.dragging = false;
	this.data = null;
}
function onDragMove(event) {
	if(this.dragging) {
		var newPosition = this.data.getLocalPosition(this.parent);
		if (newPosition.y - this.sy > border() && newPosition.y - this.sy < height - border() - paddleHeight()) {
			this.position.y = newPosition.y - this.sy;
		}
	}
}

// DIRECTION TEXT
var directionText = new Text(" ->", {fill:"black"});
container.addChild(directionText);

// SCORE
var score1 = 0;
var score2 = 0;
var score1text = new Text("0", {fill:"black"});
var score2text = new Text("0", {fill:"black"});
container.addChild(score1text);
container.addChild(score2text);

// BALL
var hits;
var wait;
var maxAngle = Math.PI / 4;
var radius = function() {
	return Math.round(Math.min(height, width) / 80);
};
var ballVelocity = radius();
var ballVelocityX;
var ballVelocityY;

var ball = new Graphics();
ball.beginFill(0x000000);
ball.drawCircle(0, 0, radius());
ball.endFill();
container.addChild(ball);

function centerBall() {
	ball.position.x = width / 2;
	ball.position.y = height / 2;
	ballVelocityX = ballVelocity;
	ballVelocityY = 0;
}
function waitForBall(winner) {
	// wait until someone presses a key
	centerBall();
	hits = 0;
	wait = true;
	if (winner === 1 && (keys.w || keys.s || keys.paddle1)) {
		ballVelocityX *= -1;
		wait = false;
		directionText.text = "";
	}
	else if (winner === 2 && (keys.up || keys.down || keys.paddle2)) {
		wait = false;
		directionText.text = "";
	}
	else {
		setTimeout(waitForBall, 1, winner);
	}
}

// RENDER
var renderer = autoDetectRenderer({"width": width, "height": height, "transparent": true});
function render() {
	// Move paddles
	if (keys.w && paddle1.position.y > border()) {
		paddle1.position.y -= paddleSpeed();
	}
	if (keys.s && paddle1.position.y < height - border() - paddleHeight()) {
		paddle1.position.y += paddleSpeed();
	}
	if (keys.up && paddle2.position.y > border()) {
		paddle2.position.y -= paddleSpeed();
	}
	if (keys.down && paddle2.position.y < height - border() - paddleHeight()) {
		paddle2.position.y += paddleSpeed();
	}
	snapPaddles();
	// Paddle/ball collision
	if (paddleIntersects(paddle1)) {
		var bounceAngle = (paddle1.position.y + (paddleHeight() / 2) - ball.position.y) * maxAngle / (paddleHeight() / 2);
		ballVelocityX = ballVelocity*Math.cos(bounceAngle);
		ballVelocityY = ballVelocity*-Math.sin(bounceAngle);
		hits++;
	}
	if (paddleIntersects(paddle2)) {
		var bounceAngle = (paddle2.position.y + (paddleHeight() / 2) - ball.position.y) * maxAngle / (paddleHeight() / 2);
		ballVelocityX = ballVelocity*-Math.cos(bounceAngle);
		ballVelocityY = ballVelocity*-Math.sin(bounceAngle);
		hits++;
	}
	// Wall/ball collision
	if (ball.position.y <= border() || ball.position.y >= height - border()) {
		ballVelocityY *= -1;
	}
	// Score collision
	if (ball.position.x <= 0) {
		score2++;
		score2text.text = score2;
		directionText.text = "->";
		waitForBall(2);
	}
	else if (ball.position.x >= width) {
		score1++;
		score1text.text = score1;
		directionText.text = "<-";
		waitForBall(1);
	}
	ballVelocity = radius() * (1 + hits / 10);
	// Move ball
	if (!wait) {
		ball.position.x += ballVelocityX;
		ball.position.y += ballVelocityY;
	}
	renderer.render(container);
	requestAnimationFrame(render);
}

// RESIZE
function resize() {
	width = window.innerWidth;
	height = window.innerHeight;

	var bodyComputedStyle = window.getComputedStyle(document.body, null);
	width -= parseInt(bodyComputedStyle.getPropertyValue("padding-left"), 10);
	width -= parseInt(bodyComputedStyle.getPropertyValue("padding-right"), 10);
	height -= parseInt(bodyComputedStyle.getPropertyValue("padding-top"), 10);
	height -= parseInt(bodyComputedStyle.getPropertyValue("padding-bottom"), 10);

	renderer.resize(width, height);

	paddle1.height = paddleHeight();
	paddle1.width = paddleWidth();

	paddle2.height = paddleHeight();
	paddle2.width = paddleWidth();

	paddle1.position.x = border();
	paddle2.position.x = width - border() - paddleWidth();
	snapPaddles();

	ball.height = 2 * radius();
	ball.width = 2 * radius();

	score1text.position.x = width/4 - score1text.width/2;
	score2text.position.x = width*3/4 - score2text.width/2;
	directionText.position.x = width/2 - directionText.width/2;
}

waitForBall(2);

document.addEventListener("DOMContentLoaded", function(event) {
	document.body.insertBefore(renderer.view, document.body.firstChild);
	window.addEventListener("resize", resize);
	resize();
	render();
});