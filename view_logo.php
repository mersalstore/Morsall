<?php
$conn = new mysqli("127.0.0.1", "u754458241_Kanan", "Code2252", "u754458241_Kanan");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$result = $conn->query("SELECT logo FROM Settings WHERE id = 'global'");
if ($result && $row = $result->fetch_assoc()) {
    echo "CURRENT_LOGO: " . $row['logo'];
} else {
    echo "NO_ROW_OR_LOGO";
}

$conn->close();
?>
