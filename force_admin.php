<?php
$host = "localhost";
$user = "u754458241_Kanan";
$pass = "CODe_2222";
$db   = "u754458241_Kanan";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$email = "blackhatsd.sd@gmail.com";

echo "<pre>";
echo "Force updating user: $email\n";

// 1. Update User Role to ADMIN
$stmt = $conn->prepare("UPDATE User SET role = 'ADMIN' WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo "✅ User role updated to ADMIN in database.\n";
} else {
    echo "ℹ️ User was already ADMIN or not found.\n";
}

// 2. Find User ID
$res = $conn->query("SELECT id FROM User WHERE email = '$email'");
if ($row = $res->fetch_assoc()) {
    $userId = $row['id'];
    echo "Found User ID: $userId\n";

    // 3. Ensure Vendor Profile exists and is APPROVED
    $vCheck = $conn->query("SELECT id FROM Vendor WHERE userId = '$userId'");
    if ($vCheck->num_rows == 0) {
        $vInsert = $conn->prepare("INSERT INTO Vendor (id, userId, storeName, status, createdAt, updatedAt) VALUES (?, ?, ?, 'APPROVED', NOW(), NOW())");
        $vId = "sys_" . substr(md5(time()), 0, 10);
        $storeName = "System Store";
        $vInsert->bind_param("sss", $vId, $userId, $storeName);
        $vInsert->execute();
        echo "✅ Created new Vendor profile (System Store).\n";
    } else {
        $conn->query("UPDATE Vendor SET status = 'APPROVED' WHERE userId = '$userId'");
        echo "✅ Existing Vendor profile set to APPROVED.\n";
    }
} else {
    echo "❌ ERROR: User $email NOT FOUND in database. Please login once first.\n";
}

echo "\nDONE. Please Logout and Login again at morsall.com\n";
echo "</pre>";

$conn->close();
?>
