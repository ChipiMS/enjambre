<?
	include "tools/header.php";
?>
	<div id="mapOptions">
		<label>Filas</label>
		<input id="rows" type="number" name="rows" value="10">
		<label>Columnas</label>
		<input id="columns" type="number" name="columns" value="20">
		<button onclick="initMap()">Crear mapa</button>
	</div>

	<canvas id="myCanvas" width="0" height="0" onclick="modifyMap(event)"></canvas>

	<div>
		<div>Movimientos</div>
		<div id="movements">0</div>
	</div>

	<ul id="menu">
		<li onclick="positionMS(0)">Poner mindstorm mirando al norte</li>
		<li onclick="positionMS(2)">Poner mindstorm mirando al sur</li>
		<li onclick="positionMS(1)">Poner mindstorm mirando al este</li>
		<li onclick="positionMS(3)">Poner mindstorm mirando al oeste</li>
		<li onclick="removeMS()">Quitar mindstorm</li>
	</ul>

	<!-- <script>
		var settings = <?=$settings ?>;
		var mines = <?=$mines ?>;
		var rows = <?=$rows ?>;
		var columns = <?=$columns ?>;
		var projectiles = <?=$projectiles ?>;
		var speed = <?=$speed ?>;
		var challenge = false;
		var email = "<?=$_SESSION["email"] ?>";
		<?
			if(isset($challengeDetails)){
				echo "challenge = ".$challengeDetails->idChallenge.";";
				echo "var game = ".($_GET["friendPosition"] === "1" ? $challengeDetails->idGame2 : $challengeDetails->idGame1).";";
				echo "var gamePosition = ".($_GET["friendPosition"] === "1" ? 2 : 1).";";
			}
			if(isset($_GET["challenge"])){
				echo "challenge = ".$_GET["challenge"].";";
				echo "var game = ".$_GET["game"].";";
				echo "var gamePosition = ".$_GET["yourPosition"].";";
			}
		?>
	</script> -->
	<script type="text/javascript" src="js/mindstormsController.js"></script>
</body>