<?php
include 'connect.php'; 

// Get form data
$name = $_POST['name'];
$origin = $_POST['from'];
$destination = $_POST['to'];
$fees = $_POST['fee'];
$flight_date = $_POST['time'];
$flight_time = $_POST['flightTime'];

// Combine date and time
$flight_datetime = $flight_date . ' ' . $flight_time;

// Insert data into flights table
$sql = "INSERT INTO flights (name, origin, destination, fees, flight_time) VALUES (?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sssss", $name, $origin, $destination, $fees, $flight_datetime);

if ($stmt->execute()) {
    $response = array("status" => "success", "message" => "Flight added successfully.");
} else {
    $response = array("status" => "error", "message" => "Error: " . $stmt->error);
}

$stmt->close();
$conn->close();

// Return response in JSON format
header('Content-Type: application/json');
echo json_encode($response);
?>
