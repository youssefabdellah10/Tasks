<?php
include 'connect.php';
session_start(); 
$response = [];

if (!isset($_SESSION['user_id'])) {
    $response["status"] = "error";
    $response["message"] = "User is not logged in.";
    echo json_encode($response); 
    exit;
} else {
    $user_id = $_SESSION['user_id'];
    $response["status"] = "success";
    $response["message"] = "User ID found in session.";
    $response["user_id"] = $user_id; 
}

// Check if user_id is valid (numeric or whatever your user_id validation is)
if (empty($user_id) || !is_numeric($user_id)) {
    $response["status"] = "error";
    $response["message"] = "Invalid user ID";
    echo json_encode($response); 
    exit;
}


if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $company_name = $_POST['company_name'];
    $bio = $_POST['bio'];
    $address = $_POST['address'];
    $location = $_POST['location'];
    $username = $_POST['username'];
    $logo_img = $_FILES['logo_img']['name'];
    $account_balance = $_POST['account_balance'];
    $target_dir = "../uploads/logos/";
    $target_file = $target_dir . basename($_FILES["logo_img"]["name"]);

    if (move_uploaded_file($_FILES["logo_img"]["tmp_name"], $target_file)) {
        $sql = "INSERT INTO companies (company_name, bio, company_address, location, username, logo_img, account_balance, user_id) 
                VALUES ('$company_name', '$bio', '$address', '$location', '$username', '$logo_img', '$account_balance', '$user_id')";

        if ($conn->query($sql) === TRUE) {
            $response["status"] = "success";
            $response["message"] = "Company registered successfully!";
        } else {
            $response["status"] = "error";
            $response["message"] = "Error: " . $conn->error;
        }
    } else {
        $response["status"] = "error";
        $response["message"] = "Logo upload failed";
    }
    echo json_encode($response);
}

$conn->close();
?>
