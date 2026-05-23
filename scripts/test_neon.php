<?php
try {
    $pdo = new PDO("pgsql:host=ep-super-meadow-a4q1l2hn-pooler.us-east-1.aws.neon.tech;dbname=neondb", "neondb_owner", "npg_jSskB54dWQti");
    echo "SUCCESS: Connected to Neon PostgreSQL\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>