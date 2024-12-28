<?php
session_start();
include 'connect.php';

$response = array();

if (!isset($_SESSION['user_id'])) {
    $response['status'] = 'error';
    $response['message'] = 'User not logged in.';
    echo json_encode($response);
    exit();
}

$user_id = $_SESSION['user_id'];

// Initialize variables
$name = $email = $phone = $photo = '';
$flights = [];

// Fetch passenger profile
$stmt = $conn->prepare("SELECT name, email, tel, photo FROM passengers WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($name, $email, $phone, $photo);
$stmt->fetch();
$stmt->close();

if (empty($name)) {
    $name = "N/A";
    $email = "N/A";
    $phone = "N/A";
    $photo = "default.png"; // Default profile image
}

// Fetch flights
$stmt = $conn->prepare("SELECT f.id, f.name, f.origin, f.destination, f.flight_time 
                        FROM flights f 
                        JOIN flight_passenger fp ON f.id = fp.flight_id 
                        JOIN passengers p ON fp.passenger_id = p.id 
                        WHERE p.user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
    $flights[] = $row;
}
$stmt->close();

$response['status'] = 'success';
$response['profile'] = array(
    'name' => $name,
    'email' => $email,
    'phone' => $phone,
    'photo' => $photo
);
$response['flights'] = $flights;

echo json_encode($response);
$conn->close();
?>