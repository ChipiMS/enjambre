// ██╗   ██╗ █████╗ ██████╗ ██╗ █████╗ ██████╗ ██╗     ███████╗███████╗
// ██║   ██║██╔══██╗██╔══██╗██║██╔══██╗██╔══██╗██║     ██╔════╝██╔════╝
// ██║   ██║███████║██████╔╝██║███████║██████╔╝██║     █████╗  ███████╗
// ╚██╗ ██╔╝██╔══██║██╔══██╗██║██╔══██║██╔══██╗██║     ██╔══╝  ╚════██║
//  ╚████╔╝ ██║  ██║██║  ██║██║██║  ██║██████╔╝███████╗███████╗███████║
//   ╚═══╝  ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚══════╝╚══════╝
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
var running = false;
var simulationIntervalHandle;
var speed;
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

function closeMenu(){
	$("#menu").css("display", "none");
}

function correctDirection(direction, delta){
	return (direction+delta)%4;
}

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
		if(ms.map.direction === 0){
			canvasContext.drawImage(msNorth, ms.map.x*msLength, ms.map.y*msLength);
		}
		if(ms.map.direction === 1){
			canvasContext.drawImage(msEast, ms.map.x*msLength, ms.map.y*msLength);
		}
		if(ms.map.direction === 2){
			canvasContext.drawImage(msSouth, ms.map.x*msLength, ms.map.y*msLength);
		}
		if(ms.map.direction === 3){
			canvasContext.drawImage(msWest, ms.map.x*msLength, ms.map.y*msLength);
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
	speed = parseInt($("#speed").val());
	width = canvas.width = columns*msLength+2;
	height = canvas.height = rows*msLength+2;
	$("#mapOptions").hide();
	$("#start").css('display', 'block');
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

function isExplorable(ms, node){
	if(node === null){
		return true;
	}
	if(node === false){
		return false;
	}
	for(let i = 0; i < 4; i++){
		if(!node.neighbors[i]){
			return true;
		}
	}
	return false;
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
	if(running){
		return;
	}
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

function move(){
	let i, ms;
	for(let i = 0; i < msInfo.length; i++){
		ms = msInfo[i];
		if(ms.map.willMove){
			ms.map.willMove = false;
			if(ms.map.direction === 0){
				if(!msInMap[ms.map.y-1][ms.map.x]){
					ms.map.y--;
				}
				else{
					return true;
				}
			}
			if(ms.map.direction === 1){
				if(!msInMap[ms.map.y][ms.map.x+1]){
					ms.map.x++;
				}
				else{
					return true;
				}
			}
			if(ms.map.direction === 2){
				if(!msInMap[ms.map.y+1][ms.map.x]){
					ms.map.y++;
				}
				else{
					return true;
				}
			}
			if(ms.map.direction === 3){
				if(!msInMap[ms.map.y][ms.map.x-1]){
					ms.map.x--;
				}
				else{
					return true;
				}
			}
		}
	}
	return false;
}

function msActionMove(ms){
	ms.map.willMove = true;
	if(ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction]){
		ms.robotMemory.actualNode = ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction];
	}
	else{
		ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction] = newNode();
		ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction].neighbors[(ms.robotMemory.direction+2)%4] = ms.robotMemory.actualNode;
		ms.robotMemory.actualNode = ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction];
	}
}

function msActionTurnLeft(ms){
	ms.map.direction = (ms.map.direction+3)%4;
	ms.robotMemory.direction = (ms.robotMemory.direction+3)%4;
}

function msActionTurnRight(ms){
	ms.map.direction = (ms.map.direction+1)%4;
	ms.robotMemory.direction = (ms.robotMemory.direction+1)%4;
}

function msSensorFrontIsClear(ms){
	if(ms.map.direction === 0){
		if(horizontalWalls[ms.map.y][ms.map.x]){
			return false;
		}
		if(ms.map.y > 0 && msInMap[ms.map.y-1][ms.map.x]){
			return false;
		}
	}
	if(ms.map.direction === 1){
		if(verticalWalls[ms.map.y][ms.map.x+1]){
			return false;
		}
		if(ms.map.x < columns-1 && msInMap[ms.map.y][ms.map.x+1]){
			return false;
		}
	}
	if(ms.map.direction === 2){
		if(horizontalWalls[ms.map.y+1][ms.map.x]){
			return false;
		}
		if(ms.map.y < rows-1 && msInMap[ms.map.y+1][ms.map.x]){
			return false;
		}
	}
	if(ms.map.direction === 3){
		if(verticalWalls[ms.map.y][ms.map.x]){
			return false;
		}
		if(ms.map.x > 0 && msInMap[ms.map.y][ms.map.x-1]){
			return false;
		}
	}
	return true;
}

function msStep(ms){
	let exploredSomething = false, i;
	for(i = 0; i < 4 && !exploredSomething; i++){
		if(isExplorable(ms, ms.robotMemory.actualNode.neighbors[correctDirection(i, ms.robotMemory.direction)])){
			exploredSomething = true;
			if(i === 0){
				if(msSensorFrontIsClear(ms)){
					msActionMove(ms);
				}
				else{
					ms.robotMemory.actualNode.neighbors[correctDirection(i, ms.robotMemory.direction)] = false;
					exploredSomething = false;
				}
			}
			else if(i === 1 || i === 2){
				msActionTurnRight(ms);
			}
			else{
				msActionTurnLeft(ms);
			}
		}
	}

	if(!exploredSomething){
		ms.robotMemory.finished = true;
	}
}

function newNode(){
	return {
		neighbors: [null, null, null, null]
	};
}

function positionMS(direction){
	let i, ms;
	if(!msInMap[menuY][menuX]){
		msInMap[menuY][menuX] = true;

		ms = {
			map: {
				direction: direction,
				willMove: false,
				x: menuX,
				y: menuY
			},
			robotMemory: {
				actualNode: newNode(),
				direction: 0,
				finished: false
			}
		};

		msInfo.push(ms);
	}
	else{
		for(i = 0; i < msInfo.length; i++){
			if(msInfo[i].map.x === menuX && msInfo[i].map.y === menuY){
				msInfo[i].map.direction = direction;
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
			if(msInfo[i].map.x === menuX && msInfo[i].map.y === menuY){
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

function start(){
	if(msInfo.length > 0 && objetiveX !== undefined){
		running = true;
		$("#start").hide();
		simulationIntervalHandle = setInterval(step, speed);
	}
}

function step(){
	let allFinished = true, crashed;
	movements++;
	for(let i = 0; i < msInfo.length; i++){
		if(!msInfo[i].robotMemory.finished){
			msStep(msInfo[i]);
			allFinished = false;
		}
	}

	crashed = move();

	if(allFinished || crashed){
		window.clearInterval(simulationIntervalHandle);
	}

	draw();
}