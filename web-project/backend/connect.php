<?php
$host = "127.0.0.1";
$db = "flight_booking";
$user = "root";
$pass = "1234";

// Create a database connection
$conn = new mysqli($host, $user, $pass, $db);

// Check the connection
if ($conn->connect_error) {
    die(json_encode(['status' => 'error', 'message' => 'Database connection failed: ' . $conn->connect_error]));
}

?>
