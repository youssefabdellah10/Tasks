<?php
session_start(); 

include 'connect.php';
// Check if form data is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get form data
    $name = $_POST['name'];
    $email = $_POST['email'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    $tel = $_POST['tel'];
    $type = $_POST['type'];

    // Check if the email already exists in the database
    $email_check_sql = "SELECT * FROM users WHERE email = ?";
    $stmt = $conn->prepare($email_check_sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode(['status' => 'error', 'message' => 'This email is already registered. Please use a different email.']);
    } else {
        $sql = "INSERT INTO users (name, email, password, tel, type) VALUES (?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssss", $name, $email, $password, $tel, $type);

        if ($stmt->execute()) {
            $_SESSION['user_id'] = $conn->insert_id;

            echo json_encode([
                'status' => 'success',
                'message' => 'Registration successful.',
                'type' => $type
            ]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Error: ' . $stmt->error]);
        }
    }

    $stmt->close();
    $conn->close();
}
?>
