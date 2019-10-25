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
var menuX, menuY;
var movements = 0;
var msInfo = [];
var msInMap;
var msLength = 35;
var objetiveX, objetiveY;
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
	drawMindstorms();
	drawObjetive();

	document.getElementById("movements").innerHTML = movements;
}

function drawMindstorms(){
	let i, ms;
	for(i = 0; i < msInfo.length; i++){
		ms = msInfo[i];
		if(ms.direction === 0){
			canvasContext.drawImage(msNorth, ms.x*msLength, ms.y*msLength);
		}
		if(ms.direction === 1){
			canvasContext.drawImage(msEast, ms.x*msLength, ms.y*msLength);
		}
		if(ms.direction === 2){
			canvasContext.drawImage(msSouth, ms.x*msLength, ms.y*msLength);
		}
		if(ms.direction === 3){
			canvasContext.drawImage(msWest, ms.x*msLength, ms.y*msLength);
		}
	}
}

function drawMap(){
	let i, j;
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

function drawObjetive(){
	if(objetiveX !== undefined){
		canvasContext.strokeStyle = "red";
		canvasContext.beginPath();
		canvasContext.rect(objetiveX*msLength+8, objetiveY*msLength+8, 21, 21);
		canvasContext.stroke();
		canvasContext.strokeStyle = "black";
	}
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
	canvasContext.strokeStyle = "black";

	initWalls();
	initMS();
	
	draw();
}

function initMS(){
	let i, j, row;
	msInMap = [];
	for(i = 0; i < rows; i++){
		row = [];
		for(j = 0; j < columns; j++){
			row.push(false);
		}
		msInMap.push(row);
	}
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
	//Walls
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
	//Menu
	if(firstLimit < absoluteX && absoluteX < lastLimit && firstLimit < absoluteY && absoluteY < lastLimit){
		showMenu(x, y, positionX, positionY);
	}

	draw();
}

function positionMS(direction){
	let i;
	if(!msInMap[menuY][menuX]){
		msInMap[menuY][menuX] = true;
		msInfo.push({
			x: menuX,
			y: menuY,
			direction: direction
		})
	}
	else{
		for(i = 0; i < msInfo.length; i++){
			if(msInfo[i].x === menuX && msInfo[i].y === menuY){
				msInfo[i].direction = direction;
			}
		}
	}

	$("#menu").css("display", "none");

	draw();
}

function positionObjetive(){
	objetiveX = menuX;
	objetiveY = menuY;

	$("#menu").css("display", "none");

	draw();
}

function removeMS(){
	let i, aux;
	if(msInMap[menuY][menuX]){
		msInMap[menuY][menuX] = false;
		for(i = 0; i < msInfo.length-1; i++){
			if(msInfo[i].x === menuX && msInfo[i].y === menuY){
				aux = msInfo[i];
				msInfo[i] = msInfo[i+1];
				msInfo[i+1] = aux;
			}
		}
		msInfo.pop();
	}

	$("#menu").css("display", "none");

	draw();
}

function showMenu(x, y, positionX, positionY){
	menuX = positionX;
	menuY = positionY;

	$("#menu").css("display", "block");
	$("#menu").css("top", positionY*msLength);
	$("#menu").css("left", positionX*msLength);
}