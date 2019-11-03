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

function createUnion(actualNode, nodeToProcess, anDirection, ntpDirection){
	if(actualNode.neighbors[anDirection].neighbor === null){
		actualNode.neighbors[anDirection].neighbor = nodeToProcess;
		nodeToProcess.neighbors[ntpDirection].neighbor = actualNode;
		if(actualNode.neighbors[anDirection].wall !== null){
			nodeToProcess.neighbors[ntpDirection].wall = actualNode.neighbors[anDirection].wall;
		}
		else if(nodeToProcess.neighbors[ntpDirection].wall !== null){
			actualNode.neighbors[anDirection].wall = nodeToProcess.neighbors[ntpDirection].wall;
		}
	}
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

function frontIsClear(ms){
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

function getMsStackTop(ms){
	return ms.robotMemory.stack[ms.robotMemory.stack.length-1];
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
	if(node.neighbor === null && node.wall !== true){
		return true;
	}
	return false;
}

function isHorizontalBorder(y){
	return y === 0 || y === rows;
}

function isVerticalBorder(x){
	return x === 0 || x === columns;
}

function isMsCorrectlyOriented(ms, direction, directionToExplore, initialDirection){
	let newDirection = (initialDirection+directionToExplore)%4;
	if(direction === newDirection){
		return true;
	}
	if(newDirection < direction){
		if(newDirection+4-direction < direction-newDirection){
			msActionTurnRight(ms);
		}
		else{
			msActionTurnLeft(ms);
		}
	}
	else{
		if(newDirection-direction < direction+4-newDirection){
			msActionTurnRight(ms);
		}
		else{
			msActionTurnLeft(ms);
		}
	}
	return false;
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
	let i, j, ms, newMap = [], newRow;
	for(i = 0; i < msInMap.length; i++){
		newRow = [];
		for(j = 0; j < msInMap[i].length; j++){
			newRow.push(false);
		}
		newMap.push(newRow);
	}
	for(i = 0; i < msInfo.length; i++){
		ms = msInfo[i];
		if(ms.map.willMove){
			ms.map.willMove = false;
			if(ms.map.direction === 0){
				if(!msInMap[ms.map.y-1][ms.map.x] && !newMap[ms.map.y-1][ms.map.x]){
					ms.map.y--;
					newMap[ms.map.y][ms.map.x] = true;
				}
				else{
					return true;
				}
			}
			if(ms.map.direction === 1){
				if(!msInMap[ms.map.y][ms.map.x+1] && !newMap[ms.map.y][ms.map.x+1]){
					ms.map.x++;
					newMap[ms.map.y][ms.map.x] = true
				}
				else{
					return true;
				}
			}
			if(ms.map.direction === 2){
				if(!msInMap[ms.map.y+1][ms.map.x] && !newMap[ms.map.y+1][ms.map.x]){
					ms.map.y++;
					newMap[ms.map.y][ms.map.x] = true;
				}
				else{
					return true;
				}
			}
			if(ms.map.direction === 3){
				if(!msInMap[ms.map.y][ms.map.x-1] && !newMap[ms.map.y][ms.map.x-1]){
					ms.map.x--;
					newMap[ms.map.y][ms.map.x] = true;
				}
				else{
					return true;
				}
			}
		}
		else{
			newMap[ms.map.y][ms.map.x] = true;
		}
	}
	msInMap = newMap;
	return false;
}

function msActionMove(ms){
	ms.map.willMove = true;
	if(ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction].neighbor){
		ms.robotMemory.actualNode = ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction].neighbor;
	}
	else{
		ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction].neighbor = newNode(ms.robotMemory.nodesCount++);
		ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction].neighbor.neighbors[(ms.robotMemory.direction+2)%4].neighbor = ms.robotMemory.actualNode;
		ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction].neighbor.neighbors[(ms.robotMemory.direction+2)%4].wall = false;
		ms.robotMemory.actualNode = ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction].neighbor;
		verifyUnions(ms);
	}
	ms.robotMemory.stack.push({
		initialDirection: ms.robotMemory.direction,
		neighborsExplored: 0,
		node: ms.robotMemory.actualNode
	});
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
	if(frontIsClear(ms)){
		if(msSensorObjetiveIsInFront(ms)){
			return false;
		}
	}
	else{
		return false;
	}
	return true;
}

function msSensorObjetiveIsInFront(ms){
	if(frontIsClear(ms)){
		if(ms.map.direction === 0 && ms.map.y > 0 && objetiveY === ms.map.y-1 && objetiveX === ms.map.x){
			return true;
		}
		if(ms.map.direction === 1 && ms.map.x < columns-1 && objetiveY === ms.map.y && objetiveX === ms.map.x+1){
			return true;
		}
		if(ms.map.direction === 2 && ms.map.y < rows-1 && objetiveY === ms.map.y+1 && objetiveX === ms.map.x){
			return true;
		}
		if(ms.map.direction === 3 && ms.map.x > 0 && objetiveY === ms.map.y && objetiveX === ms.map.x-1){
			return true;
		}
	}
	return false;
}

function msStep(ms){
	let exploredSomething = false, state = getMsStackTop(ms), i = state.neighborsExplored;
	while(i < 4 && !exploredSomething){
		if(isExplorable(ms, ms.robotMemory.actualNode.neighbors[correctDirection(i, state.initialDirection)])){
			exploredSomething = true;
		}
		else{
			i++;
		}
	}

	if(i < 4){
		if(isMsCorrectlyOriented(ms, ms.robotMemory.direction, i, state.initialDirection)){
			if(msSensorFrontIsClear(ms)){
				msActionMove(ms);
			}
			else{
				if(msSensorObjetiveIsInFront(ms)){
					ms.robotMemory.finished = true;
				}
				ms.robotMemory.actualNode.neighbors[correctDirection(i, state.initialDirection)].wall = true;
				if(ms.robotMemory.actualNode.neighbors[correctDirection(i, state.initialDirection)].neighbor){
					ms.robotMemory.actualNode.neighbors[correctDirection(i, state.initialDirection)].neighbor.neighbors[correctDirection(2, correctDirection(i, state.initialDirection))].wall = true;
				}
			}
		}
		state.neighborsExplored = i;
	}
	else{
		if(isMsCorrectlyOriented(ms, ms.robotMemory.direction, 2, state.initialDirection)){
			ms.robotMemory.stack.pop();
			if(ms.robotMemory.stack.length > 0){
				msActionMove(ms);
				ms.robotMemory.stack.pop();
			}
			else{
				ms.robotMemory.finished = true;
			}
		}
	}
}

function newNeighbor(){
	return {
		neighbor: null,
		wall: null
	}
}

function newNode(id){
	return {
		id: id,
		neighbors: [newNeighbor(), newNeighbor(), newNeighbor(), newNeighbor()]
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
				actualNode: newNode(0),
				direction: 0,
				finished: false,
				nodesCount: 1,
				stack: []
			}
		};
		ms.robotMemory.stack.push({
			initialDirection: 0,
			neighborsExplored: 0,
			node: ms.robotMemory.actualNode
		});

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

function verifyUnions(ms){
	let i, j, visited = [], queue = [], actualNode = ms.robotMemory.actualNode, nodeToProcess;
	for(i = 0; i < ms.robotMemory.nodesCount; i++){
		visited.push(false);
	}

	queue.push({
		node: ms.robotMemory.actualNode,
		x: 0,
		y: 0
	});
	visited[ms.robotMemory.nodesCount-1] = true;

	while(queue.length > 0){
		nodeToProcess = queue.shift();

		if(nodeToProcess.x === 0){
			if(nodeToProcess.y === 1){
				createUnion(actualNode, nodeToProcess.node, 2, 0);
			}
			if(nodeToProcess.y === -1){
				createUnion(actualNode, nodeToProcess.node, 0, 2);
			}
		}
		if(nodeToProcess.y === 0){
			if(nodeToProcess.x === 1){
				createUnion(actualNode, nodeToProcess.node, 1, 3);
			}
			if(nodeToProcess.x === -1){
				createUnion(actualNode, nodeToProcess.node, 3, 1);
			}
		}

		for(i = 0; i < 4; i++){
			if(nodeToProcess.node.neighbors[i].neighbor && !visited[nodeToProcess.node.neighbors[i].neighbor.id]){
				queue.push({
					node: nodeToProcess.node.neighbors[i].neighbor,
					x: nodeToProcess.x+(i % 2 === 1 ? (i === 1 ? 1: -1) : 0),
					y: nodeToProcess.y+(i % 2 === 0 ? (i === 0 ? -1: 1) : 0)
				});
				visited[nodeToProcess.node.neighbors[i].neighbor.id] = true;
			}
		}
	}
}