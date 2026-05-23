<?php
$conn = new mysqli("localhost", "u754458241_Kanan", "Code_2252", "u754458241_Kanan");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
echo "Connected successfully to MySQL!";
$conn->close();
?>
