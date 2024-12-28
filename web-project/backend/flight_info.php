<?php
session_start();
include 'connect.php';

$response = array();

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    $response['status'] = 'error';
    $response['message'] = 'User not logged in.';
    echo json_encode($response);
    exit();
}

$user_id = $_SESSION['user_id'];

if ($_SERVER["REQUEST_METHOD"] == "GET" && isset($_GET['flight_id'])) {
    $flight_id = $_GET['flight_id'];

    // Fetch flight information
    $stmt = $conn->prepare("SELECT id, name, origin, destination, fees, passenger_count, flight_time FROM flights WHERE id = ?");
    $stmt->bind_param("i", $flight_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        $response['status'] = 'success';
        $response['flight_info'] = $row;
    } else {
        $response['status'] = 'error';
        $response['message'] = 'Flight not found.';
    }
    $stmt->close();
} elseif ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['flight_id']) && isset($_POST['payment_type'])) {
    $flight_id = $_POST['flight_id'];
    $payment_type = $_POST['payment_type'];

    // Fetch the passenger ID using the user ID
    $stmt = $conn->prepare("SELECT id FROM passengers WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $stmt->bind_result($passenger_id);
    $stmt->fetch();
    $stmt->close();

    // Check if the user has already booked this flight
    $stmt = $conn->prepare("SELECT COUNT(*) FROM flight_passenger WHERE flight_id = ? AND passenger_id = ?");
    $stmt->bind_param("ii", $flight_id, $passenger_id);
    $stmt->execute();
    $stmt->bind_result($count);
    $stmt->fetch();
    $stmt->close();

    if ($count > 0) {
        $response['status'] = 'error';
        $response['message'] = 'You have already booked this flight.';
    } else {
        if ($payment_type == 'account') {
            // Fetch the flight fee
            $stmt = $conn->prepare("SELECT fees FROM flights WHERE id = ?");
            $stmt->bind_param("i", $flight_id);
            $stmt->execute();
            $stmt->bind_result($fees);
            $stmt->fetch();
            $stmt->close();

            // Check if the user has enough balance
            $stmt = $conn->prepare("SELECT account_balance FROM passengers WHERE id = ?");
            $stmt->bind_param("i", $passenger_id);
            $stmt->execute();
            $stmt->bind_result($account_balance);
            $stmt->fetch();
            $stmt->close();

            if ($account_balance >= $fees) {
                // Deduct the flight fee from the user's account balance
                $stmt = $conn->prepare("UPDATE passengers SET account_balance = account_balance - ?, fees = fees + ? WHERE id = ?");
                $stmt->bind_param("ddi", $fees, $fees, $passenger_id);
                $stmt->execute();
                $stmt->close();

                // Add the flight to the user's booked flights
                $stmt = $conn->prepare("INSERT INTO flight_passenger (flight_id, passenger_id, booking_date) VALUES (?, ?, NOW())");
                $stmt->bind_param("ii", $flight_id, $passenger_id);
                $stmt->execute();
                $stmt->close();

                // Increment the passenger count in the flights table
                $stmt = $conn->prepare("UPDATE flights SET passenger_count = passenger_count + 1 WHERE id = ?");
                $stmt->bind_param("i", $flight_id);
                $stmt->execute();
                $stmt->close();

                // Fetch the updated passenger count
                $stmt = $conn->prepare("SELECT passenger_count FROM flights WHERE id = ?");
                $stmt->bind_param("i", $flight_id);
                $stmt->execute();
                $stmt->bind_result($updated_passenger_count);
                $stmt->fetch();
                $stmt->close();

                $response['status'] = 'success';
                $response['message'] = 'Flight booked successfully!';
                $response['updated_passenger_count'] = $updated_passenger_count;
            } else {
                $response['status'] = 'error';
                $response['message'] = 'Insufficient balance to book the flight.';
            }
        } else {
            // Handle cash payment (no implementation)
            $response['status'] = 'error';
            $response['message'] = 'Please contact the company to complete the payment.';
        }
    }
} else {
    $response['status'] = 'error';
    $response['message'] = 'Invalid request method.';
}

echo json_encode($response);
$conn->close();
?>