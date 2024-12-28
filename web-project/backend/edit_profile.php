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

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    // Fetch user profile
    $stmt = $conn->prepare("SELECT name, email, tel, photo FROM passengers WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $stmt->bind_result($name, $email, $phone, $photo);
    $stmt->fetch();
    $stmt->close();

    $response['status'] = 'success';
    $response['profile'] = array(
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'photo' => $photo
    );
} elseif ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Update user profile
    $name = $_POST['name'];
    $email = $_POST['email'];
    $phone = $_POST['phone'];
    $photo = '';

    if (isset($_FILES['photo']) && $_FILES['photo']['error'] == UPLOAD_ERR_OK) {
        $photo = '../uploads/logs' . basename($_FILES['photo']['name']);
        move_uploaded_file($_FILES['photo']['tmp_name'], $photo);
    }

    $stmt = $conn->prepare("UPDATE passengers SET name = ?, email = ?, tel = ?, photo = ? WHERE user_id = ?");
    $stmt->bind_param("ssssi", $name, $email, $phone, $photo, $user_id);
    if ($stmt->execute()) {
        $response['status'] = 'success';
        $response['message'] = 'Profile updated successfully.';
    } else {
        $response['status'] = 'error';
        $response['message'] = 'Failed to update profile.';
    }
    $stmt->close();
} else {
    $response['status'] = 'error';
    $response['message'] = 'Invalid request method.';
}

echo json_encode($response);
$conn->close();
?>