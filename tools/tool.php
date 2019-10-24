<?
	class dataBase extends mysqli{
		var $dbBlock;
		var $registers;
		function addFriend($friend){
			$this->multi_query("call addFriend('".$_SESSION["email"]."', '".$friend."', @message); select @message as message;");
			$this->next_result();
			$secondQuery = $this->store_result();
			$message = $secondQuery->fetch_object()->message;
			$secondQuery->free();
			return $message;
		}
		function dataBase($server, $user, $pwd, $bd){
			$this->connect($server, $user, $pwd, $bd);
		}
		function closeDB(){
			$this->close();
		}
		function dbQuery($query){
			$this->dbBlock = $this->query($query);
			if($this->error > ""){
				echo $query;
				echo $this->error;
				exit();
			}
			if(strpos(strtoupper($query), "SELECT") === 0){
				$this->registers = $this->dbBlock->num_rows;
			}
			else{
				$this->registers = $this->affected_rows;
			}
		}
		function displayFinishedChallenge($challenge, $resources){
			if($challenge->yourDead === "Win" && $challenge->otherDead !== "Win"){
				$result = "perdió el desafío";
			}
			else if($challenge->yourDead !== "Win" && $challenge->otherDead === "Win"){
				$result = "ganó el desafío";
			}
			else if($challenge->yourDead === "Win" && $challenge->otherDead === "Win"){
				if($challenge->yourTime < $challenge->otherTime){
					$result = "perdió el desafío";
				}
				else{
					$result = "ganó el desafío";
				}
			}
			else{
				if($challenge->yourTime > $challenge->otherTime){
					$result = "perdió el desafío";
				}
				else{
					$result = "ganó el desafío";
				}
			}
			echo '<div class="finishedChallenge">';
				$resources->loadPhoto($challenge->photo);
				echo '<h5>'.$challenge->name.' '.$challenge->lastName.' ('.$challenge->email.') '.$result.'</h5>';
			echo '</div>';
		}
		function getRegisterArray(){
			return $this->dbBlock->fetch_array();
		}
		function getRegisterObject(){
			return $this->dbBlock->fetch_object();
		}
		function showBestGames($settings, $resources){
			$this->dbQuery("select *
				from Game g inner join User u on g.playerId = u.email
				where dead = 'Win' and g.idSettings = '".$settings."'
				order by gameTime"
			);
			$games = $this->registers;
			for($i = 0; $i < $games; $i++){
				$game = $this->getRegisterObject();
				echo '<div class="bestGame">';
					echo '<h5>'.($i+1).'.- '.$game->name.' '.$game->lastName.' ('.$game->email.') '.$game->gameTime.'</h5>';
					$resources->loadPhoto($game->photo);
				echo '</div>';
			}
			if($games === 0){
				echo '<h2>Nadie ha ganado</h2>';
			}
		}
		function showFinishedChallenges($resources){
			$totalChallenges = 0;
			$this->dbQuery("select u.name, u.lastName, u.email, u.photo, yourGame.dead yourDead, yourGame.gameTime yourTime, otherGame.dead otherDead, otherGame.gameTime otherTime
				from Friendship f inner join Challenge c on f.idFriendShip = c.idFriendship
					inner join User u on f.email2 = u.email
					inner join Game yourGame on yourGame.idGame = c.idGame1
					inner join Game otherGame on otherGame.idGame = c.idGame2
				where c.played1 = 1 and c.played2 =1 and f.email1 = '".$_SESSION["email"]."'"
			);
			$challenges = $this->registers;
			$totalChallenges += $challenges;
			for($i = 0; $i < $challenges; $i++){
				$challenge = $this->getRegisterObject();
				$this->displayFinishedChallenge($challenge, $resources);
			}
			$this->dbQuery("select u.name, u.lastName, u.email, u.photo, yourGame.dead yourDead, yourGame.gameTime yourTime, otherGame.dead otherDead, otherGame.gameTime otherTime
				from Friendship f inner join Challenge c on f.idFriendShip = c.idFriendship
					inner join User u on f.email1 = u.email
					inner join Game yourGame on yourGame.idGame = c.idGame2
					inner join Game otherGame on otherGame.idGame = c.idGame1
				where c.played1 = 1 and c.played2 =1 and f.email2 = '".$_SESSION["email"]."'"
			);
			$challenges = $this->registers;
			$totalChallenges += $challenges;
			for($i = 0; $i < $challenges; $i++){
				$challenge = $this->getRegisterObject();
				$this->displayFinishedChallenge($challenge, $resources);
			}
			if($totalChallenges === 0){
				echo "<h2>No has terminado ningún desafío</h2>";
			}
		}
		function showForm(){
			$cad = "SELECT * from ".$_POST['tabla'];
			if(isset($_POST['id'])){
				$cad .= " where ".$_POST['columna']."='".$_POST['id']."'";
			}
			$cad .= " limit 1";
			$this->dbQuery($cad);
			if(isset($_POST['id'])){
				$tupla = $this->getRegisterArray();
			}
			echo '<form method="post">';
			$numeColumnas = $this->dbBlock->field_count;
			for($c = 0; $c < $numeColumnas; $c++){
				$campo = $this->dbBlock->fetch_field();
				if(!($campo->flags & MYSQLI_AUTO_INCREMENT_FLAG && $campo->flags & MYSQLI_PRI_KEY_FLAG)){ //SI NO ES CAMPO PRIMARIO Y AUTOINCREMENTADO
					echo '<label>'.$campo->name;
					switch($campo->type){
						case 252:
							echo '<textarea name="'.$campo->name.'" >'.((isset($tupla[$c]))?$tupla[$c]:"").'</textarea>';
							break;
						case 1: case 3:
							echo '<input type ="number" name="'.$campo->name.'" size="5" value="'.((isset($tupla[$c]))?$tupla[$c]:"").'" />';
							break;
						case 12:
							echo '<input type="datetime" name="'.$campo->name.'" value="'.((isset($tupla[$c]))?$tupla[$c]:"").'"/>';
							break; 
						default: 
							if($campo->length){
								echo '<input type="text" name="'.$campo->name.'" maxlengh="'.$campo->length.'" size=""  value="'.((isset($tupla[$c]))?$tupla[$c]:"").'"/>';
							}
							else{
								echo '<input type="text" name="'.$campo->name.'" value="'.((isset($tupla[$c]))?$tupla[$c]:"").'" />'; 
							}
					}
					echo '</label><br>';
				}
			}

			// INCORPORAR 2 CAMPOS  OCULTOS PARA ENVIAR LA TABLA Y NO PERDERLA ASI COMO LA LLAVE PRIMARIA
			echo '<input type="hidden" name="tabla" value="'.$_POST['tabla'].'"/>';
			if(isset($_POST['id'])){
				echo '<input type="hidden" name="id" value="'.$_POST['id'].'"/>';
			}
			if(isset($_POST['columna'])){
				echo '<input type="hidden" name="columna" value="'.$_POST['columna'].'"/>';
			}

			// INCORPORAR UN BOTON PARA EL ENVIO, CON EL MENSAJE ADECUADO ES DECIR SI ES NUEVO CON LA LEYENDA Agregar, si no Actualizar
			if(isset($_POST['id'])){
				echo '<input type="submit" name="Actualizar" value="Actualizar"/>';
			}
			else{
				echo '<input type="submit" name="Agregar" value="Agregar"/>';
			}
			
			echo '</form>';
		}
		function showFriends($resources){
			$totalFriends = 0;
			$this->dbQuery("select *
				from Friendship f inner join User u on f.email1 = u.email
				where f.accepted = true and f.email2 = '".$_SESSION["email"]."'"
			);
			$friends = $this->registers;
			$totalFriends += $friends;
			for($i = 0; $i < $friends; $i++){
				$friend = $this->getRegisterObject();
				echo '<div class="friend">';
					$resources->loadPhoto($friend->photo);
					echo '<h5>'.$friend->name.' '.$friend->lastName.' ('.$friend->email.')</h5>';
					echo '<a href="game.php?friendship='.$friend->idFriendShip.'&friendPosition=1&friend='.urlencode($friend->email).'">Desafiar</a>';
				echo '</div>';
			}
			$this->dbQuery("select *
				from Friendship f inner join User u on f.email2 = u.email
				where f.accepted = true and f.email1 = '".$_SESSION["email"]."'"
			);
			$friends = $this->registers;
			$totalFriends += $friends;
			for($i = 0; $i < $friends; $i++){
				$friend = $this->getRegisterObject();
				echo '<div class="friend">';
					$resources->loadPhoto($friend->photo);
					echo '<h5>'.$friend->name.' '.$friend->lastName.' ('.$friend->email.')</h5>';
					echo '<a href="game.php?friendship='.$friend->idFriendShip.'&friendPosition=2&friend='.urlencode($friend->email).'">Desafiar</a>';
				echo '</div>';
			}
			if($totalFriends === 0){
				echo "<h2>No tienes amigos</h2>";
			}
		}
		function showPendingChallenges($resources){
			$totalChallenges = 0;
			$this->dbQuery("select *
				from Friendship f inner join Challenge c on f.idFriendShip = c.idFriendship
					inner join User u on f.email2 = u.email
				where c.played1 = 0 and f.email1 = '".$_SESSION["email"]."'"
			);
			$challenges = $this->registers;
			$totalChallenges += $challenges;
			for($i = 0; $i < $challenges; $i++){
				$challenge = $this->getRegisterObject();
				echo '<div class="pendingChallenge">';
					$resources->loadPhoto($challenge->photo);
					echo '<h5>'.$challenge->name.' '.$challenge->lastName.' ('.$challenge->email.') te ha retado a un desafío</h5>';
					echo '<a href="game.php?challenge='.$challenge->idChallenge.'&yourPosition=1&game='.$challenge->idGame1.'&settings='.$challenge->idSettings.'">Aceptar desafío</a>';
				echo '</div>';
			}
			$this->dbQuery("select *
				from Friendship f inner join Challenge c on f.idFriendShip = c.idFriendship
					inner join User u on f.email1 = u.email
				where c.played2 = 0 and f.email2 = '".$_SESSION["email"]."'"
			);
			$challenges = $this->registers;
			$totalChallenges += $challenges;
			for($i = 0; $i < $challenges; $i++){
				$challenge = $this->getRegisterObject();
				echo '<div class="pendingChallenge">';
					$resources->loadPhoto($challenge->photo);
					echo '<h5>'.$challenge->name.' '.$challenge->lastName.' ('.$challenge->email.') te ha retado a un desafío</h5>';
					echo '<a href="game.php?challenge='.$challenge->idChallenge.'&yourPosition=2&game='.$challenge->idGame2.'&settings='.$challenge->idSettings.'">Aceptar desafío</a>';
				echo '</div>';
			}
			if($totalChallenges === 0){
				echo "<h2>No tienes desafíos pendientes</h2>";
			}
		}
		function showSettings($idSettings, $selectable = false){
			$this->dbQuery("select *
				from Settings
				where idSettings = ".$idSettings
			);
			$settings = $this->getRegisterObject();
			echo '<div class="settings">';
				echo '<h2>'.$settings->name.'</h2>';
				echo '<ul>';
					echo '<li>Columnas: '.$settings->columns.'</li>';
					echo '<li>Minas: '.$settings->mines.'</li>';
					echo '<li>Proyectiles: '.$settings->projectiles.'</li>';
					echo '<li>Renglones: '.$settings->rows.'</li>';
					echo '<li>Velocidad: '.$settings->speed.'</li>';
				echo '</ul>';
				if($selectable){
					echo '<a href="?idSettings='.$idSettings.'">Seleccionar</a>';
				}
			echo '</div>';
		}
		function showStatistics(){
			$this->dbQuery("select *
				from Game
				where dodgedProjectiles != 0 and playerId = '".$_SESSION["email"]."'"
			);
			$dodgedProjectiles = 0;
			$banana = 0;
			$eagleLeft = 0;
			$eagleRight = 0;
			$falcon = 0;
			$frog = 0;
			$minesweeper = 0;
			$touchedEdge = 0;
			$win = 0;
			$seconds = 0;
			$minutes = 0;
			$hours = 0;
			$remainder = 0;
			$games = $this->registers;
			for($i = 0; $i < $games; $i++){
				$game = $this->getRegisterObject();
				$dodgedProjectiles += $game->dodgedProjectiles;
				switch($game->dead){
					case 'banana':
						$banana++;
						break;
					case 'eagleLeft':
						$eagleLeft++;
						break;
					case 'eagleRight':
						$eagleRight++;
						break;
					case 'falcon':
						$falcon++;
						break;
					case 'frog':
						$frog++;
						break;
					case 'minesweeper':
						$minesweeper++;
						break;
					case 'touchedEdge':
						$touchedEdge++;
						break;
					case 'Win':
						$win++;
						break;
				}
				$seconds += substr($game->gameTime, 6, 7);
				$remainder = floor($seconds/60);
				$seconds %= 60;
				$minutes += substr($game->gameTime, 3, 2)+$remainder;
				$remainder = floor($minutes/60);
				$minutes %= 60;
				$hours += substr($game->gameTime, 0, 2)+$remainder;
			}
			echo '<ul class="statistics">';
				echo '<li>Proyectiles esquivados: '.$dodgedProjectiles.'</li>';
				echo '<li>Muertes por platanazo: '.$banana.'</li>';
				echo '<li>Muertes por halcón: '.$falcon.'</li>';
				echo '<li>Muertes por aguilas: '.($eagleLeft+$eagleRight).'</li>';
				echo '<li>Muertes por rana: '.$frog.'</li>';
				echo '<li>Muertes por llegar a la orilla: '.$touchedEdge.'</li>';
				echo '<li>Muertes por activar una mina: '.$minesweeper.'</li>';
				echo '<li>Victorias: '.$win.'</li>';
				echo '<li>Tiempo total de juego: '.$hours.':'.($minutes > 9? $minutes : '0'.$minutes).':'.($seconds > 9? $seconds : '0'.$seconds).'</li>';
			echo '</ul>';
		}
		function showTable($delete = 0, $edit = 0, $new = 0, $border = 1, $pairRowColor = "#BBB"){
			$rowsNumber = $this->registers;
			$columnsNumber = $this->dbBlock->field_count;
			$primaryKeyPosition = -1;
			$primaryKeyName = "";
			$columnas = array();
			$campo = $this->dbBlock->fetch_field();
			$tableName = $campo->table;
			$this->dbBlock->field_seek(0);
			if($new){
				echo '<p>
					<form action="formulario.php" method="post">
						<input type="hidden" name="tabla" value="'.$tableName.'"/>
						<input type="image" name="new" src="../images/'.$_SESSION['icon_new'].'"/>
					</form>
				</p>';
			}
			echo '<table border="'.$border.'">';
			// Cabeceras
			echo '<tr style="background: rgba(0, 0, 0, 0.5);">';
			for($c = 0; $c < $columnsNumber; $c++){
				$campo = $this->dbBlock->fetch_field();
				$tableName = $campo->table;
				if($campo->flags & MYSQLI_PRI_KEY_FLAG){
					$primaryKeyPosition = $c;
					$primaryKeyName = $campo->name;
				}
				echo '<th>'.$campo->name.'</th>';
			}
			if($delete){
				echo '<td>&nbsp;</td>';
			}
			if($edit){
				echo '<td>&nbsp;</td>';
			}
			echo '</tr>';
			// Datos
			for($r = 0; $r < $rowsNumber; $r++){
				echo '<tr '.($r%2 == 1 ? 'style="background: '.$pairRowColor.'"' : '').'>';
				$registro = $this->getRegisterArray();
				for($c = 0; $c < $columnsNumber; $c++){
					echo '<td>'.$registro[$c].'</td>';
				}
				if($delete){
					echo '<td>
						<form action="borrRegistro.php" method="post">
							<input type="hidden" name="tabla" value="'.$tableName.'"/>
							<input type="hidden" name="columna" value="'.$primaryKeyName.'"/>
							<input type="hidden" name="id" value="'.$registro[$primaryKeyPosition].'"/>
							<input type="image" name="delete" src="../images/'.$_SESSION['icon_delete'].'"/>
						</form>
					</td>';
				}
				if($edit){
					echo '<td>
						<form action="formulario.php" method="post">
							<input type="hidden" name="tabla" value="'.$tableName.'"/>
							<input type="hidden" name="columna" value="'.$primaryKeyName.'"/>
							<input type="hidden" name="id" value="'.$registro[$primaryKeyPosition].'"/>
							<input type="image" name="edit" src="../images/'.$_SESSION['icon_edit'].'"/>
						</form>
					</td>';
				}
				echo '</tr>';
			}
			echo '</table>';
		}
		function showTableTutor($p_iconos = array(), $border = 1, $pairRowColor = "#BBB"){
			$rowsNumber = $this->registers;
			$columnsNumber = $this->dbBlock->field_count;
			$primaryKeyPosition = -1;
			$primaryKeyName = "";
			$columnas = array();
			$campo = $this->dbBlock->fetch_field();
			$tableName = $campo->table;
			$this->dbBlock->field_seek(0);
			if(in_array('nuevo', $p_iconos)){
				echo '<p>
					<form action="formulario.php" method="post">
						<input type="hidden" name="tabla" value="'.$tableName.'"/>
						<input type="image" name="new" src="../images/'.$_SESSION['icon_new'].'"/>
					</form>
				</p>';
			}
			echo '<table border="'.$border.'">';
			// Cabeceras
			echo '<tr style="background: rgba(0, 0, 0, 0.5);">';
			for($c = 0; $c < $columnsNumber; $c++){
				$campo = $this->dbBlock->fetch_field();
				$tableName = $campo->table;
				if($campo->flags & MYSQLI_PRI_KEY_FLAG){
					$primaryKeyPosition = $c;
					$primaryKeyName = $campo->name;
				}
				echo '<th>'.$campo->name.'</th>';
			}
			foreach($p_iconos as $value){
				echo '<td>&nbsp;</td>';
			}
			echo '</tr>';
			// Datos
			for($r = 0; $r < $rowsNumber; $r++){
				echo '<tr '.($r%2 == 1 ? 'style="background: '.$pairRowColor.'"' : '').'>';
				$registro = $this->getRegisterArray();
				for($c = 0; $c < $columnsNumber; $c++){
					echo '<td>'.$registro[$c].'</td>';
				}
				if(in_array('borrar', $p_iconos)){
					echo '<td>
						<form action="borrRegistro.php" method="post">
							<input type="hidden" name="tabla" value="'.$tableName.'"/>
							<input type="hidden" name="columna" value="'.$primaryKeyName.'"/>
							<input type="hidden" name="id" value="'.$registro[$primaryKeyPosition].'"/>
							<input type="image" name="delete" src="../images/'.$_SESSION['icon_delete'].'"/>
						</form>
					</td>';
				}
				if(in_array('lista', $p_iconos)){
					echo '<td>
						<form action="lista.php" method="post">
						<input type="hidden" name="nombreGrupo" value="'.$registro['Grupo'].'"/>
							<input type="hidden" name="id" value="'.$registro[$primaryKeyPosition].'"/>
							<input type="image" name="list" src="../images/list.ico"/>
						</form>
					</td>';
				}
				if(in_array('actualizar', $p_iconos)){
					echo '<td>
						<form action="formulario.php" method="post">
							<input type="hidden" name="tabla" value="'.$tableName.'"/>
							<input type="hidden" name="columna" value="'.$primaryKeyName.'"/>
							<input type="hidden" name="id" value="'.$registro[$primaryKeyPosition].'"/>
							<input type="image" name="edit" src="../images/'.$_SESSION['icon_edit'].'"/>
						</form>
					</td>';
				}
				echo '</tr>';
			}
			echo '</table>';
		}
		function startChallenge($friendship, $email1, $email2){
			$this->multi_query("call startChallenge('".$friendship."', '".$_SESSION["gameSettings"]."', '".$email1."', '".$email2."', @idGame1, @idGame2, @idChallenge); select @idGame1 as idGame1, @idGame2 as idGame2, @idChallenge as idChallenge;");
			$this->next_result();
			$secondQuery = $this->store_result();
			$outVariables = $secondQuery->fetch_object();
			$secondQuery->free();
			return $outVariables;
		}
	}
	// $dataBaseObject = new dataBase($_SESSION["servidor"], $_SESSION["uBD"], $_SESSION["pBD"], $_SESSION["nBD"]);
?>