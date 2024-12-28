<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Company Messages</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(to right, #6a11cb, #2575fc);
            color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            padding: 1rem;
        }
        .container {
            background: #ffffff;
            color: #333;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
            width: 100%;
            max-width: 500px;
            text-align: center;
        }
        h2 {
            color: #6a11cb;
            font-size: 1.6rem;
            margin-bottom: 1rem;
        }
        .message-list {
            list-style: none;
            padding: 0;
        }
        .message-item {
            background: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 6px;
            margin-bottom: 0.8rem;
            padding: 0.8rem;
            cursor: pointer;
            text-align: left;
        }
        .message-item:hover {
            border-color: #6a11cb;
            background: #f0f0ff;
        }
        .message-item p {
            margin-top: 0.5rem;
            display: none;
            font-size: 0.9rem;
            color: #555;
        }
        .message-item p.expanded {
            display: block;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Company Messages</h2>
        <ul class="message-list">
            <?php
            session_start();
            include 'connect.php';

            // Check if the user is logged in and is a company
            if (isset($_SESSION['user_id'])) {
                $company_id = $_SESSION['user_id'];

                // Fetch messages for the logged-in company
                $sql = "SELECT * FROM messages WHERE company_id = ?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("i", $company_id);
                $stmt->execute();
                $result = $stmt->get_result();

                if ($result->num_rows > 0) {
                    while ($row = $result->fetch_assoc()) {
                        echo "
                        <li class='message-item' onclick='expandMessage(this)'>
                            <strong>Message #" . htmlspecialchars($row['id']) . "</strong>
                            <p>" . htmlspecialchars($row['message']) . "</p>
                        </li>";
                    }
                } else {
                    echo "<p>No messages found for this company.</p>";
                }

                $stmt->close();
            } else {
                echo "<p>You are not logged in or unauthorized.</p>";
            }

            $conn->close();
            ?>
        </ul>
    </div>

    <script>
        function expandMessage(element) {
            const details = element.querySelector('p');
            details.classList.toggle('expanded');
        }
    </script>
</body>
</html>
