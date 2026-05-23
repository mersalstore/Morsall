<?php
$host = "localhost";
$user = "u754458241_Kanan";
$pass = "l$9Qs3i]g0y]/V~k";
$db   = "u754458241_Kanan";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) { die("Connection failed: " . $conn->connect_error); }

$email = "blackhatsd.sd@gmail.com";

echo "<pre>";
echo "--- RESETTING ACCOUNT: $email ---\n";

// 1. Get User ID
$res = $conn->query("SELECT id FROM User WHERE email = '$email'");
if ($row = $res->fetch_assoc()) {
    $userId = $row['id'];
    echo "Found User ID: $userId. Deleting...\n";

    // Delete everything related to this user
    $conn->query("DELETE FROM Account WHERE userId = '$userId'");
    $conn->query("DELETE FROM Session WHERE userId = '$userId'");
    $conn->query("DELETE FROM Vendor WHERE userId = '$userId'");
    $conn->query("DELETE FROM User WHERE id = '$userId'");
    echo "✅ Account deleted successfully.\n";
} else {
    echo "ℹ️ Account not found, no need to delete.\n";
}

// 2. Re-create User as ADMIN
$newUserId = "usr_" . substr(md5(time() . "salt"), 0, 10);
$passHash = password_hash("Morsall@112233", PASSWORD_BCRYPT);
$stmt = $conn->prepare("INSERT INTO User (id, email, name, role, password, isOnboarded, createdAt, updatedAt) VALUES (?, ?, 'System Admin', 'ADMIN', ?, 1, NOW(), NOW())");
$stmt->bind_param("sss", $newUserId, $email, $passHash);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo "✅ User re-created as ADMIN.\n";
    
    // 3. Create Vendor Profile
    $vendorId = "vnd_" . substr(md5(time() . "vendor"), 0, 10);
    $vStmt = $conn->prepare("INSERT INTO Vendor (id, userId, storeName, status, createdAt, updatedAt) VALUES (?, ?, 'System Store', 'APPROVED', NOW(), NOW())");
    $vStmt->bind_param("ss", $vendorId, $newUserId);
    $vStmt->execute();
    echo "✅ Vendor profile (System Store) created and APPROVED.\n";
} else {
    echo "❌ Failed to re-create user.\n";
}

echo "\n--- RESET COMPLETE ---\n";
echo "Please Login at morsall.com with:\n";
echo "Email: $email\n";
echo "Pass: Morsall@112233\n";
echo "</pre>";

$conn->close();
?>
