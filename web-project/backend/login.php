<?php
session_start();
include 'connect.php';

$response = array();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST['email'];
    $password = $_POST['password'];

    // Validate input
    if (empty($email) || empty($password)) {
        $response['status'] = 'error';
        $response['message'] = 'Email and password are required.';
        echo json_encode($response);
        exit();
    }

    // Check user credentials
    $stmt = $conn->prepare("SELECT id, password, type FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->bind_result($user_id, $hashed_password, $user_type);
    $stmt->fetch();
    $stmt->close();

    if ($user_id && password_verify($password, $hashed_password)) {
        $_SESSION['user_id'] = $user_id;
        $_SESSION['email'] = $email;
        $_SESSION['type'] = $user_type;

        $response['status'] = 'success';
        $response['message'] = 'Login successful.';

        // Check user type and set redirect URL
        if ($user_type === 'company') {
            $response['redirect'] = './company-info.html';
        } else {
            $response['redirect'] = './passenger_profile.html';
        }
    } else {
        $response['status'] = 'error';
        $response['message'] = 'Invalid email or password.';
    }

    echo json_encode($response);
    exit();
} else {
    $response['status'] = 'error';
    $response['message'] = 'Invalid request method.';
    echo json_encode($response);
    exit();
}
?>