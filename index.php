<head>
	<link rel="stylesheet" type="text/css" href="css/styles.css">
	<script type="text/javascript" src="js/jquery-3.3.1.min.js"></script>
	<title>Enjambre</title>
</head>
<body>
	<div id="mapOptions">
		<label>Filas</label>
		<input id="rows" type="number" name="rows" value="10">
		<label>Columnas</label>
		<input id="columns" type="number" name="columns" value="20">
		<label>Velocidad >= 40</label>
		<input id="speed" type="number" name="columns" value="1000">
		<button onclick="initMap()">Crear mapa</button>
	</div>

	<canvas id="myCanvas" width="0" height="0" onclick="modifyMap(event)"></canvas>

	<button id="start" style="display: none;" onclick="start()">Comenzar</button>

	<div>
		<div>Movimientos</div>
		<div id="movements">0</div>
	</div>

	<!-- <div onclick="step()">Paso</div> -->

	<ul id="menu">
		<li onclick="positionMS(0)">Poner mindstorm mirando al norte</li>
		<li onclick="positionMS(2)">Poner mindstorm mirando al sur</li>
		<li onclick="positionMS(1)">Poner mindstorm mirando al este</li>
		<li onclick="positionMS(3)">Poner mindstorm mirando al oeste</li>
		<li onclick="removeMS()">Quitar mindstorm</li>
		<li onclick="positionObjetive()">Agregar objetivo</li>
		<li onclick="closeMenu()">Cancelar</li>
	</ul>

	<script type="text/javascript" src="js/mindstormsController.js"></script>
</body>