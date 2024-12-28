<?php
session_start();
include 'connect.php';

$response = array();

if ($_SERVER["REQUEST_METHOD"] == "GET" && isset($_GET['from']) && isset($_GET['to'])) {
    $from = $_GET['from'];
    $to = $_GET['to'];

    // Fetch flights based on search criteria
    $stmt = $conn->prepare("SELECT id, name, origin, destination, fees, flight_time FROM flights WHERE origin = ? AND destination = ?");
    $stmt->bind_param("ss", $from, $to);
    $stmt->execute();
    $result = $stmt->get_result();

    $flights = array();
    while ($row = $result->fetch_assoc()) {
        $flights[] = $row;
    }
    $stmt->close();

    if (!empty($flights)) {
        $response['status'] = 'success';
        $response['flights'] = $flights;
    } else {
        $response['status'] = 'error';
        $response['message'] = 'No flights found.';
    }
} else {
    $response['status'] = 'error';
    $response['message'] = 'Invalid request.';
}

echo json_encode($response);
$conn->close();
?>