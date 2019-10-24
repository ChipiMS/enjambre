// ██╗   ██╗ █████╗ ██████╗ ██╗ █████╗ ██████╗ ██╗     ███████╗███████╗
// ██║   ██║██╔══██╗██╔══██╗██║██╔══██╗██╔══██╗██║     ██╔════╝██╔════╝
// ██║   ██║███████║██████╔╝██║███████║██████╔╝██║     █████╗  ███████╗
// ╚██╗ ██╔╝██╔══██║██╔══██╗██║██╔══██║██╔══██╗██║     ██╔══╝  ╚════██║
//  ╚████╔╝ ██║  ██║██║  ██║██║██║  ██║██████╔╝███████╗███████╗███████║
//   ╚═══╝  ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚══════╝╚══════╝
var animationIntervalHandle;
var building = false;
var canvas = document.getElementById("myCanvas");
var canvasContext = canvas.getContext("2d");
var columns;
var height;
var horizontalWalls;
var loadedImages = 0;
var movements = 0;
var msLength = 35;
var rows;
var verticalWalls;
var width;
// ██╗███╗   ███╗ █████╗  ██████╗ ███████╗███████╗
// ██║████╗ ████║██╔══██╗██╔════╝ ██╔════╝██╔════╝
// ██║██╔████╔██║███████║██║  ███╗█████╗  ███████╗
// ██║██║╚██╔╝██║██╔══██║██║   ██║██╔══╝  ╚════██║
// ██║██║ ╚═╝ ██║██║  ██║╚██████╔╝███████╗███████║
// ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚══════╝
var msNorth = new Image();
msNorth.src = "images/msNorth.png";

var msSouth = new Image();
msSouth.src = "images/msSouth.png";

var msEast = new Image();
msEast.src = "images/msEast.png";

var msWest = new Image();
msWest.src = "images/msWest.png";
// ███████╗██╗   ██╗███╗   ██╗ ██████╗████████╗██╗ ██████╗ ███╗   ██╗███████╗
// ██╔════╝██║   ██║████╗  ██║██╔════╝╚══██╔══╝██║██╔═══██╗████╗  ██║██╔════╝
// █████╗  ██║   ██║██╔██╗ ██║██║        ██║   ██║██║   ██║██╔██╗ ██║███████╗
// ██╔══╝  ██║   ██║██║╚██╗██║██║        ██║   ██║██║   ██║██║╚██╗██║╚════██║
// ██║     ╚██████╔╝██║ ╚████║╚██████╗   ██║   ██║╚██████╔╝██║ ╚████║███████║
// ╚═╝      ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝

function draw(){
	canvasContext.clearRect(0, 0, width, height);

	drawMap();
	document.getElementById("movements").innerHTML = movements;
}

function drawMindstorm(){
	if(orientation === 0){
		canvasContext.drawImage(kWest, positionX, positionY);
	}
	if(orientation === 1){
		canvasContext.drawImage(kNorth, positionX, positionY);
	}
	if(orientation === 2){
		canvasContext.drawImage(kEast, positionX, positionY);
	}
	if(orientation === 3){
		canvasContext.drawImage(kSouth, positionX, positionY);
	}
}

function drawMap(){
	let i, j;
	//Border
	// canvasContext.beginPath();
	// canvasContext.moveTo(0, 0);
	// canvasContext.lineTo(0, height);
	// canvasContext.lineTo(width, height);
	// canvasContext.lineTo(width, 0);
	// canvasContext.lineTo(0, 0);
	// canvasContext.stroke();
	//Squares
	for(i = 0; i < rows; i++){
		for(j = 0; j < columns; j++){
			canvasContext.beginPath();
			canvasContext.rect(j*msLength+8, i*msLength+8, 21, 21);
			canvasContext.stroke();
		}
	}

	drawWalls();
}

function drawWalls(){
	let i, j;
	for(i = 0; i < rows+1; i++){
		for(j = 0; j < columns+1; j++){
			if(horizontalWalls[i][j]){
				canvasContext.beginPath();
				canvasContext.moveTo(j*msLength+1, i*msLength+1);
				canvasContext.lineTo((j+1)*msLength+1, i*msLength+1);
				canvasContext.stroke();
			}
		}
	}

	for(i = 0; i < rows+1; i++){
		for(j = 0; j < columns+1; j++){
			if(verticalWalls[i][j]){
				canvasContext.beginPath();
				canvasContext.moveTo(j*msLength+1, i*msLength+1);
				canvasContext.lineTo(j*msLength+1, (i+1)*msLength+1);
				canvasContext.stroke();
			}
		}
	}
}

function initMap(){
	rows = parseInt($("#rows").val());
	columns = parseInt($("#columns").val());
	width = canvas.width = columns*msLength+2;
	height = canvas.height = rows*msLength+2;
	$("#mapOptions").hide();
	building = true;

	initWalls();
	
	draw();
}

function initWalls(){
	let i, j, row;
	horizontalWalls = [];
	for(i = 0; i < rows+1; i++){
		row = [];
		for(j = 0; j < columns+1; j++){
			row.push(isHorizontalBorder(i));
		}
		horizontalWalls.push(row);
	}

	verticalWalls = [];
	for(i = 0; i < rows+1; i++){
		row = [];
		for(j = 0; j < columns+1; j++){
			row.push(isVerticalBorder(j));
		}
		verticalWalls.push(row);
	}
}

function isHorizontalBorder(y){
	return y === 0 || y === rows;
}

function isVerticalBorder(x){
	return x === 0 || x === columns;
}

function modifyMap(event){
	var firstLimit = 5, lastLimit = 29;
	let x = event.clientX-1, y = event.clientY-1, positionX = Math.floor(x/msLength), positionY = Math.floor(y/msLength), absoluteX = x%msLength, absoluteY = y%msLength;
	if(absoluteX <= firstLimit && firstLimit < absoluteY && absoluteY < lastLimit){
		if(!isVerticalBorder(positionX)){
			verticalWalls[positionY][positionX] = !verticalWalls[positionY][positionX];
		}
	}
	if(absoluteX >= lastLimit && firstLimit < absoluteY && absoluteY < lastLimit){
		if(!isVerticalBorder(positionX+1)){
			verticalWalls[positionY][positionX+1] = !verticalWalls[positionY][positionX+1];
		}
	}
	if(absoluteY <= firstLimit && firstLimit < absoluteX && absoluteX < lastLimit){
		if(!isHorizontalBorder(positionY)){
			horizontalWalls[positionY][positionX] = !horizontalWalls[positionY][positionX];
		}
	}
	if(absoluteY >= lastLimit && firstLimit < absoluteX && absoluteX < lastLimit){
		if(!isHorizontalBorder(positionY+1)){
			horizontalWalls[positionY+1][positionX] = !horizontalWalls[positionY+1][positionX];
		}
	}

	draw();
}