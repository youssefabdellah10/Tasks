<?php
// Start session and include database connection
session_start();
include 'connect.php';

// Fetch companies
$companies = [];
$stmt = $conn->prepare("SELECT company_id, company_name FROM companies");
$stmt->execute();
$result = $stmt->get_result();
while ($row = $result->fetch_assoc()) {
    $companies[] = $row;
}
$stmt->close();

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Ensure the user is logged in
    if (!isset($_SESSION['user_id'])) {
        echo '<script>alert("You must be logged in to send a message.");</script>';
        exit;
    }

    $user_id = $_SESSION['user_id'];
    $company_id = $_POST['company'];
    $message = trim($_POST['message']);

    if (empty($message)) {
        echo '<script>alert("Message cannot be empty.");</script>';
        exit;
    }

    // Fetch the passenger ID using the user ID
    $stmt = $conn->prepare("SELECT id FROM passengers WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $stmt->bind_result($passenger_id);
    $stmt->fetch();
    $stmt->close();

    if (!$passenger_id) {
        echo '<script>alert("Passenger not found.");</script>';
        exit;
    }

    // Insert the message into the Messages table
    $stmt = $conn->prepare("INSERT INTO Messages (company_id, passenger_id, message) VALUES (?, ?, ?)");
    $stmt->bind_param("iis", $company_id, $passenger_id, $message);
    if ($stmt->execute()) {
        echo '<script>alert("Message sent successfully!"); window.location.href = "../frontend/passenger_profile.html";</script>';
    } else {
        echo '<script>alert("Failed to send the message.");</script>';
    }
    $stmt->close();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Send Message to Company</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(to right, #6a11cb, #2575fc);
            color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }

        .container {
            background-color: #ffffff;
            color: #333;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            width: 100%;
            max-width: 800px;
            text-align: center;
        }

        .container h1 {
            font-size: 2rem;
            margin-bottom: 1rem;
            color: #6a11cb;
        }

        .form-group {
            margin-bottom: 1rem;
            text-align: left;
        }

        label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: bold;
        }

        input[type="text"],
        textarea,
        select {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 1rem;
            margin-bottom: 1rem;
        }

        button {
            width: 100%;
            padding: 0.75rem;
            border-radius: 6px;
            font-size: 1rem;
            background: #6a11cb;
            color: #fff;
            border: none;
            cursor: pointer;
            transition: 0.3s ease;
        }

        button:hover {
            background: #2575fc;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Submit Message</h1>
        <form method="POST" action="submit_message.php">
            <div class="form-group">
                <label for="company">Select Company</label>
                <select id="company" name="company" required>
                    <option value="">Select a company</option>
                    <?php foreach ($companies as $company): ?>
                        <option value="<?php echo $company['company_id']; ?>"><?php echo $company['company_name']; ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="form-group">
                <label for="message">Message</label>
                <textarea id="message" name="message" rows="5" required></textarea>
            </div>
            <button type="submit">Send Message</button>
        </form>
    </div>
</body>
</html>