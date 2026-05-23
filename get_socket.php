<?php
header('Content-Type: text/plain');
$mysqli = new mysqli("localhost", "u754458241_Kanan", "Mersal2026");
if ($mysqli->connect_error) {
    die("Connect Error: " . $mysqli->connect_error);
}
$result = $mysqli->query("SHOW VARIABLES LIKE 'socket'");
$row = $result->fetch_assoc();
echo "Socket: " . $row['Value'] . "\n";
?>
