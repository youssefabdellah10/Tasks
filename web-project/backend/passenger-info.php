<?php
session_start();
header('Content-Type: application/json');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

include 'connect.php';

$user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
if (!$user_id) {
    echo json_encode(['status' => 'error', 'message' => 'User is not logged in.']);
    exit();
}

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['type']) && $_POST['type'] == 'passenger') {
    $target_dir = "../uploads/logos/";

    // Validate file uploads
    if ($_FILES['photo']['error'] !== UPLOAD_ERR_OK || $_FILES['passport_img']['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(['status' => 'error', 'message' => 'File upload error.']);
        exit();
    }

    // Move uploaded files
    $photo_path = $target_dir . basename($_FILES["photo"]["name"]);
    $passport_img_path = $target_dir . basename($_FILES["passport_img"]["name"]);

    if (!is_dir($target_dir)) {
        mkdir($target_dir, 0777, true);
    }

    if (!move_uploaded_file($_FILES["photo"]["tmp_name"], $photo_path) || !move_uploaded_file($_FILES["passport_img"]["tmp_name"], $passport_img_path)) {
        echo json_encode(['status' => 'error', 'message' => 'Error moving uploaded files.']);
        exit();
    }

    // Validate required fields
    $required_fields = ['name'];
    foreach ($required_fields as $field) {
        if (empty($_POST[$field])) {
            echo json_encode(['status' => 'error', 'message' => "Field '$field' is required."]);
            exit();
        }
    }

    // Fetch user details from users table
    $stmt = $conn->prepare("SELECT email, password, tel FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $stmt->bind_result($email, $password, $tel);
    $stmt->fetch();
    $stmt->close();

    // Prepare and execute SQL statement
    $stmt = $conn->prepare("INSERT INTO passengers (user_id, name, email, password, tel, photo, passport_img) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("issssss", $user_id, $_POST['name'], $email, $password, $tel, $photo_path, $passport_img_path);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Passenger info saved successfully.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $stmt->error]);
    }

    $stmt->close();
    $conn->close();
}
?>