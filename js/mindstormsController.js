// ██╗   ██╗ █████╗ ██████╗ ██╗ █████╗ ██████╗ ██╗     ███████╗███████╗
// ██║   ██║██╔══██╗██╔══██╗██║██╔══██╗██╔══██╗██║     ██╔════╝██╔════╝
// ██║   ██║███████║██████╔╝██║███████║██████╔╝██║     █████╗  ███████╗
// ╚██╗ ██╔╝██╔══██║██╔══██╗██║██╔══██║██╔══██╗██║     ██╔══╝  ╚════██║
//  ╚████╔╝ ██║  ██║██║  ██║██║██║  ██║██████╔╝███████╗███████╗███████║
//   ╚═══╝  ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚══════╝╚══════╝
var bfsVisited;
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
function addDistance(node){
	let i, queue = [], actualNode = node, nodeToProcess;

	actualNode.distance = 0;
	queue.push(actualNode);

	while(queue.length > 0){
		nodeToProcess = queue.shift();

		for(i = 0; i < 4; i++){
			if(nodeToProcess.neighbors[i].neighbor && nodeToProcess.neighbors[i].wall === false && nodeToProcess.neighbors[i].neighbor.distance === undefined){
				nodeToProcess.neighbors[i].neighbor.distance = nodeToProcess.distance+1;
				queue.push(nodeToProcess.neighbors[i].neighbor);
			}
		}
	}
}

function broadcastObjetive(superFriend, objetive){
	let i, ms;
	for(i = 0; i < msInfo.length; i++){
		ms = msInfo[i];
		if(getSuperFriend(ms) === superFriend){
			ms.robotMemory.objetiveNode = objetive;
		}
	}

	addDistance(ms.robotMemory.objetiveNode);
}

function closeMenu(){
	$("#menu").css("display", "none");
}

function correctDirection(direction, delta){
	return (direction+delta)%4;
}

function correctDirections(superFriend, delta){
	let i, j, ms;
	for(i = 0; i < msInfo.length; i++){
		ms = msInfo[i];
		if(getSuperFriend(ms) === superFriend){
			ms.robotMemory.direction = correctDirection(ms.robotMemory.direction, delta);
			for(j = 0; j < ms.robotMemory.stack.length; j++){
				ms.robotMemory.stack[j].initialDirection = correctDirection(ms.robotMemory.stack[j].initialDirection, delta);
			}
		}
	}
}

function correctFriendsNodesCount(superFriend, newCount){
	let i, ms;
	for(i = 0; i < msInfo.length; i++){
		ms = msInfo[i];
		if(getSuperFriend(ms) === superFriend){
			ms.robotMemory.nodesCount = newCount;
		}
	}
}

function correctNodes(node, countStart, lastCount, delta){
	let i, queue = [], nodeToProcess, newId = countStart;

	queue.push(node);
	node.newId = newId++;

	while(queue.length > 0){
		nodeToProcess = queue.shift();

		nodeToProcess.directionCorrection = correctDirection(nodeToProcess.directionCorrection, delta);

		for(i = 0; i < 4; i++){
			if(nodeToProcess.neighbors[i].neighbor && nodeToProcess.neighbors[i].neighbor.newId === undefined){
				queue.push(nodeToProcess.neighbors[i].neighbor);
				nodeToProcess.neighbors[i].neighbor.newId = newId++;
			}
		}
	}

	queue.push(node);
	node.id = node.newId;
	delete node.newId;

	while(queue.length > 0){
		nodeToProcess = queue.shift();

		for(i = 0; i < 4; i++){
			if(nodeToProcess.neighbors[i].neighbor && nodeToProcess.neighbors[i].neighbor.newId !== undefined){
				queue.push(nodeToProcess.neighbors[i].neighbor);
				nodeToProcess.neighbors[i].neighbor.id = nodeToProcess.neighbors[i].neighbor.newId;
				delete nodeToProcess.neighbors[i].neighbor.newId;
			}
		}
	}
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
	}
	if(ms.map.direction === 1){
		if(verticalWalls[ms.map.y][ms.map.x+1]){
			return false;
		}
	}
	if(ms.map.direction === 2){
		if(horizontalWalls[ms.map.y+1][ms.map.x]){
			return false;
		}
	}
	if(ms.map.direction === 3){
		if(verticalWalls[ms.map.y][ms.map.x]){
			return false;
		}
	}
	return true;
}

function getClosestExpedition(ms, direction){
	let i;
	bfsVisited = [];
	for(i = 0; i < ms.robotMemory.nodesCount; i++){
		bfsVisited.push(false);
	}
	bfsVisited[ms.robotMemory.actualNode.id] = true;
	if(ms.robotMemory.actualNode.neighbors[direction].wall === false && ms.robotMemory.actualNode.neighbors[direction].neighbor){
		return getClosestExpeditionAlgorithm(ms.robotMemory.actualNode.neighbors[direction].neighbor);
	}
	return -1;
}

function getClosestExpeditionAlgorithm(node){
	let i, result, best = -1;
	if(bfsVisited[node.id]){
		return -1;
	}
	bfsVisited[node.id] = true;
	for(i = 0; i < 4; i++){
		if(isExplorable(node.neighbors[i])){
			return 1;
		}
		else{
			if(node.neighbors[i].wall === false && node.neighbors[i].neighbor){
				result = getClosestExpeditionAlgorithm(node.neighbors[i].neighbor);
				if(result !== -1){
					if(best === -1){
						best = result;
					}
					else{
						if(result < best){
							best = result;
						}
					}
				}
			}
		}
	}

	bfsVisited[node.id] = false;

	if(best !== -1){
		return best+1;
	}
	return -1;
}

function getCloseToTheObjetive(ms){
	let i, bestPath = 4, bestDistance = ms.robotMemory.actualNode.distance;
	for(i = 0; i < 4; i++){

		if(ms.robotMemory.actualNode.neighbors[i].neighbor && ms.robotMemory.actualNode.neighbors[i].neighbor.distance && ms.robotMemory.actualNode.neighbors[i].neighbor.distance < bestDistance){
			bestDistance = ms.robotMemory.actualNode.neighbors[i].neighbor.distance;
			bestPath = i;
		}
	}

	return bestPath;
}

function getDirectionDelta(ms, friend){
	const absoluteMsDelta = (ms.map.direction-ms.robotMemory.direction+4)%4, absoluteFriendDelta = (friend.map.direction-friend.robotMemory.direction+4)%4;
	return (absoluteFriendDelta-absoluteMsDelta+4)%4;
}

function getFriends(superFriend){
	let i, ms, friends = [];
	for(i = 0; i < msInfo.length; i++){
		ms = msInfo[i];
		if(getSuperFriend(ms) === superFriend){
			friends.push(ms);
		}
	}
	return friends;
}

function getMsStackTop(ms){
	return ms.robotMemory.stack[ms.robotMemory.stack.length-1];
}

function getSuperFriend(ms){
	if(ms.robotMemory.bestFriend === ms.robotMemory.id){
		return ms.robotMemory.bestFriend;
	}
	else{
		return getSuperFriend(msInfo[ms.robotMemory.bestFriend]);
	}
}

function goToExplore(ms){
	let i, closest = -1, direction = 4, result;
	for(i = 0; i < 4; i++){
		if(isExplorable(ms.robotMemory.actualNode.neighbors[i])){
			return i;
		}
		result = getClosestExpedition(ms, i);
		if(result !== -1){
			if(closest === -1){
				closest = result;
				direction = i;
			}
			else{
				if(result < closest){
					closest = result;
					direction = i;
				}
			}
		}
	}

	return direction;
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

function isExplorable(node){
	if(node.neighbor === null && node.wall !== true){
		return true;
	}
	if(node.neighbor !== null && node.wall === null){
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

function meetFriend(ms){
	let i, friend, superFriend1, superFriend2, delta, newNodesCount;
	for(i = 0; i < msInfo.length; i++){
		if(ms.map.direction === 0 && msInfo[i].map.y === ms.map.y-1 && ms.map.x === msInfo[i].map.x){
			friend = msInfo[i];
		}
		if(ms.map.direction === 1 && msInfo[i].map.y === ms.map.y && ms.map.x+1 === msInfo[i].map.x){
			friend = msInfo[i];
		}
		if(ms.map.direction === 2 && msInfo[i].map.y === ms.map.y+1 && ms.map.x === msInfo[i].map.x){
			friend = msInfo[i];
		}
		if(ms.map.direction === 3 && msInfo[i].map.y === ms.map.y && ms.map.x-1 === msInfo[i].map.x){
			friend = msInfo[i];
		}
	}

	superFriend1 = getSuperFriend(ms);
	superFriend2 = getSuperFriend(friend);
	if(superFriend1 !== superFriend2){
		delta = getDirectionDelta(ms, friend);

		correctDirections(superFriend2, delta);

		correctNodes(friend.robotMemory.actualNode, ms.robotMemory.nodesCount, friend.robotMemory.nodesCount, delta);

		msInfo[superFriend2].robotMemory.bestFriend = superFriend1;

		ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction].wall = false;

		createUnion(ms.robotMemory.actualNode, friend.robotMemory.actualNode, ms.robotMemory.direction, correctDirection(ms.robotMemory.direction, 6-delta));

		newNodesCount = mergueMaps(ms.robotMemory.actualNode, getFriends(superFriend1), ms.robotMemory.objetiveNode || friend.robotMemory.objetiveNode, superFriend1, ms.robotMemory.nodesCount+friend.robotMemory.nodesCount);

		correctFriendsNodesCount(superFriend1, newNodesCount);
	}
}

function mergueMaps(node, friends, objetive, superFriend, nodesCount){
	let i, visited = [], queue = [], actualNode = node, nodeToProcess, newNodes = {}, correctedDirection, newNodesCount = 0, id, newObjetive;
	for(i = 0; i < nodesCount; i++){
		visited.push(false);
	}

	queue.push({
		node: node,
		x: 0,
		y: 0
	});
	visited[node.id] = true;

	while(queue.length > 0){
		nodeToProcess = queue.shift();
		id = positionToString(nodeToProcess.x, nodeToProcess.y);

		if(!newNodes[id]){
			newNodes[id] = newNode(newNodesCount++);
			for(i = 0; i < friends.length; i++){
				if(friends[i].robotMemory.actualNode === nodeToProcess.node){
					friends[i].robotMemory.actualNode = newNodes[id];
				}
			}
			if(objetive && objetive === nodeToProcess.node){
				newObjetive = nodeToProcess.node;
			}
		}


		for(i = 0; i < 4; i++){
			correctedDirection = correctDirection(i, 4-nodeToProcess.node.directionCorrection);
			if(nodeToProcess.node.neighbors[correctedDirection].wall !== null){
				newNodes[id].neighbors[i].wall = nodeToProcess.node.neighbors[correctedDirection].wall;
			}
		}

		if(newNodes[positionToString(nodeToProcess.x+1, nodeToProcess.y)]){
			createUnion(newNodes[id], newNodes[positionToString(nodeToProcess.x+1, nodeToProcess.y)], 1, 3);
		}
		if(newNodes[positionToString(nodeToProcess.x-1, nodeToProcess.y)]){
			createUnion(newNodes[id], newNodes[positionToString(nodeToProcess.x-1, nodeToProcess.y)], 3, 1);
		}
		if(newNodes[positionToString(nodeToProcess.x, nodeToProcess.y-1)]){
			createUnion(newNodes[id], newNodes[positionToString(nodeToProcess.x, nodeToProcess.y-1)], 0, 2);
		}
		if(newNodes[positionToString(nodeToProcess.x, nodeToProcess.y+1)]){
			createUnion(newNodes[id], newNodes[positionToString(nodeToProcess.x, nodeToProcess.y+1)], 2, 0);
		}

		for(i = 0; i < 4; i++){
			correctedDirection = correctDirection(i, 4-nodeToProcess.node.directionCorrection);
			if(nodeToProcess.node.neighbors[correctedDirection].neighbor && !visited[nodeToProcess.node.neighbors[correctedDirection].neighbor.id]){
				queue.push({
					node: nodeToProcess.node.neighbors[correctedDirection].neighbor,
					x: nodeToProcess.x+(i % 2 === 1 ? (i === 1 ? 1: -1) : 0),
					y: nodeToProcess.y+(i % 2 === 0 ? (i === 0 ? -1: 1) : 0)
				});
				visited[nodeToProcess.node.neighbors[correctedDirection].neighbor.id] = true;
			}
		}
	}

	if(newObjetive){
		broadcastObjetive(superFriend, newObjetive);
	}

	return newNodesCount;
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

function msActionMove(ms, dontPush){
	ms.map.willMove = true;
	if(ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction].neighbor){
		ms.robotMemory.actualNode = ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction].neighbor;
	}
	else{
		ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction].neighbor = newNode(ms.robotMemory.nodesCount++);
		ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction].wall = false;
		correctFriendsNodesCount(getSuperFriend(ms), ms.robotMemory.nodesCount);
		ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction].neighbor.neighbors[(ms.robotMemory.direction+2)%4].neighbor = ms.robotMemory.actualNode;
		ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction].neighbor.neighbors[(ms.robotMemory.direction+2)%4].wall = false;
		ms.robotMemory.actualNode = ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction].neighbor;
		verifyUnions(ms);
	}
	if(!dontPush){
		ms.robotMemory.stack.push({
			initialDirection: ms.robotMemory.direction,
			neighborsExplored: 0,
			node: ms.robotMemory.actualNode
		});
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

function msSensorFriendIsInFront(ms){
	if(frontIsClear(ms)){
		if(ms.map.direction === 0 && ms.map.y > 0 && msInMap[ms.map.y-1][ms.map.x]){
			return true;
		}
		if(ms.map.direction === 1 && ms.map.x < columns-1 && msInMap[ms.map.y][ms.map.x+1]){
			return true;
		}
		if(ms.map.direction === 2 && ms.map.y < rows-1 && msInMap[ms.map.y+1][ms.map.x]){
			return true;
		}
		if(ms.map.direction === 3 && ms.map.x > 0 && msInMap[ms.map.y][ms.map.x-1]){
			return true;
		}
	}
	return false;
}

function msSensorFrontIsClear(ms){
	if(frontIsClear(ms)){
		if(msSensorObjetiveIsInFront(ms)){
			return false;
		}
		if(msSensorFriendIsInFront(ms)){
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
	if(ms.robotMemory.objetiveNode){
		let newPosition = getCloseToTheObjetive(ms);
		if(newPosition === 4){
			ms.robotMemory.finished = true;
		}
		else{
			if(isMsCorrectlyOriented(ms, ms.robotMemory.direction, newPosition, 0)){
				if(msSensorFrontIsClear(ms)){
					msActionMove(ms, true);
				}
				else{
					ms.robotMemory.finished = true;
				}
			}
		}
	}
	else{
		if(ms.robotMemory.stack.length > 0){
			let exploredSomething = false, state = getMsStackTop(ms), i = state.neighborsExplored;
			while(i < 4 && !exploredSomething){
				if(isExplorable(ms.robotMemory.actualNode.neighbors[correctDirection(i, state.initialDirection)])){
					exploredSomething = true;
				}
				else{
					i++;
				}
			}

			if(i < 4){
				if(isMsCorrectlyOriented(ms, ms.robotMemory.direction, i, state.initialDirection)){
					if(msSensorFrontIsClear(ms)){
						if(ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction].neighbor){
							ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction].wall = false;
							ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction].neighbor.neighbors[correctDirection(2, ms.robotMemory.direction)].wall = false;
						}
						else{
							msActionMove(ms);
						}
					}
					else{
						if(ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction].neighbor){
							if(!msSensorObjetiveIsInFront(ms) && !msSensorFriendIsInFront(ms)){
								ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction].wall = false;
								ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction].neighbor.neighbors[correctDirection(2, ms.robotMemory.direction)].wall = false;
							}
						}
						else if(msSensorObjetiveIsInFront(ms)){
							ms.robotMemory.finished = true;
							ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction].neighbor = newNode(ms.robotMemory.nodesCount++);
							ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction].wall = false;
							correctFriendsNodesCount(getSuperFriend(ms), ms.robotMemory.nodesCount);
							ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction].neighbor.neighbors[correctDirection(2, ms.robotMemory.direction)].neighbor = ms.robotMemory.actualNode;
							ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction].neighbor.neighbors[correctDirection(2, ms.robotMemory.direction)].wall = false;
							ms.robotMemory.objetiveNode = ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction].neighbor;
							verifyUnions(ms);
							broadcastObjetive(getSuperFriend(ms), ms.robotMemory.objetiveNode);
						}
						else if(msSensorFriendIsInFront(ms)){
							meetFriend(ms);
						}
						else{
							const direction = correctDirection(i, state.initialDirection);
							ms.robotMemory.actualNode.neighbors[direction].wall = true;
							if(ms.robotMemory.actualNode.neighbors[direction].neighbor){
								ms.robotMemory.actualNode.neighbors[direction].neighbor.neighbors[correctDirection(2, direction)].wall = true;
							}
						}
					}
				}
				else{
					if(msSensorFriendIsInFront(ms)){
						meetFriend(ms);
					}
				}
				
				state.neighborsExplored = i;
			}
			else{
				if(isMsCorrectlyOriented(ms, ms.robotMemory.direction, 2, state.initialDirection)){
					if(msSensorFrontIsClear){
						ms.robotMemory.stack.pop();
						if(ms.robotMemory.stack.length > 0){
							msActionMove(ms);
							ms.robotMemory.stack.pop();
						}
					}
				}
			}
		}
		else{
			let newPosition = goToExplore(ms);
			if(newPosition === 4){
				ms.robotMemory.finished = true;
			}
			else{
				if(isMsCorrectlyOriented(ms, ms.robotMemory.direction, newPosition, 0)){
					if(isExplorable(ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction])){
						if(msSensorFrontIsClear(ms)){
							msActionMove(ms);
						}
						else{
							if(msSensorObjetiveIsInFront(ms)){
								ms.robotMemory.finished = true;
								ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction].neighbor = newNode(ms.robotMemory.nodesCount++);
								ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction].wall = false;
								correctFriendsNodesCount(getSuperFriend(ms), ms.robotMemory.nodesCount);
								ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction].neighbor.neighbors[correctDirection(2, ms.robotMemory.direction)].neighbor = ms.robotMemory.actualNode;
								ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction].neighbor.neighbors[correctDirection(2, ms.robotMemory.direction)].wall = false;
								ms.robotMemory.objetiveNode = ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction].neighbor;
								verifyUnions(ms);
								broadcastObjetive(getSuperFriend(ms), ms.robotMemory.objetiveNode);
							}
							else if(msSensorFriendIsInFront(ms)){
								meetFriend(ms);
							}
							else{
								ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction].wall = true;
								if(ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction].neighbor){
									ms.robotMemory.actualNode.neighbors[ms.robotMemory.direction].neighbor.neighbors[correctDirection(2, ms.robotMemory.direction)].wall = true;
								}
							}
						}
					}
					else{
						if(frontIsClear(ms)){
							msActionMove(ms, true);
						}
						else{
							meetFriend(ms);
						}
					}
				}
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
		directionCorrection: 0,
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
				objetiveNode: null,
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

function positionToString(x, y){
	return (x < 0? "$"+(-x): x)+"_"+(y < 0? "$"+(-y): y);
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
		for(let i = 0; i < msInfo.length; i++){
			msInfo[i].robotMemory.id = i;
			msInfo[i].robotMemory.bestFriend = i;
		}
		$("#start").hide();
		while(step());
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

	draw();

	if(allFinished || crashed){
		return false;
	}
	return true;
}

function verifyUnions(ms){
	let i, j, visited = [], queue = [], actualNode = ms.robotMemory.objetiveNode || ms.robotMemory.actualNode, nodeToProcess;
	for(i = 0; i < ms.robotMemory.nodesCount; i++){
		visited.push(false);
	}

	queue.push({
		node: actualNode,
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