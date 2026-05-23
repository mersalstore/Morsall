<?php
$servername = "127.0.0.1";
$username = "u754458241_Kanan";
$password = "Mersal2026";
$dbname = "u754458241_Kanan";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

$sql = "DESCRIBE Account";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
  while($row = $result->fetch_assoc()) {
    echo $row["Field"] . " - " . $row["Type"] . "<br>";
  }
} else {
  echo "0 results";
}
$conn->close();
?>
