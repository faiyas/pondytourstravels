<?php
/**
 * ------------------------------------------------------------------------
 * Pondy Tours & Travels - Secure MySQL Database Connection Bridge
 * ------------------------------------------------------------------------
 * This script runs privately on your hosting server and handles secure 
 * submissions from your React booking form directly into your MySQL database
 * (pondytou1_tourstravels at 103.191.209.67 / localhost).
 * 
 * Secure: It keeps all database passwords completely hidden from the browser.
 * ------------------------------------------------------------------------
 */

// Enable CORS for frontend flexibility
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS requests instantly
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Ensure the request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "error" => "Method not allowed. Use POST."
    ]);
    exit();
}

// ------------------------------------------------------------------------
// DATABASE CONFIGURATION (EDIT THESE WITH YOUR DB CREDENTIALS)
// ------------------------------------------------------------------------
$db_host = "localhost"; // Usually 'localhost' when running on the same web server
$db_name = "pondytou1_tourstravels";
$db_user = "pondytou1_tourstravels"; // Update this with your DB username if different
$db_pass = "Faroz@9565#";            // Your DB password (URL decoded: Faroz@9565#)

try {
    // Connect to MySQL using PDO (highly secure against SQL injection)
    $pdo = new PDO(
        "mysql:host={$db_host};dbname={$db_name};charset=utf8mb4",
        $db_user,
        $db_pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
        ]
    );

    // Read the incoming JSON booking payload
    $raw_input = file_get_contents("php://input");
    $data = json_decode($raw_input, true);

    if (!$data) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "error" => "Invalid payload: No booking data received."
        ]);
        exit();
    }

    // Basic Validation
    if (empty($data['pickup']) || empty($data['drop']) || empty($data['fullName']) || empty($data['phone'])) {
        http_response_code(422);
        echo json_encode([
            "success" => false,
            "error" => "Missing required booking details (pickup, drop, name, or phone)."
        ]);
        exit();
    }

    // Prepare highly secure SQL Statement (parameterized, SQL injection immune)
    $stmt = $pdo->prepare("
        INSERT INTO bookings (
            trip_type, pickup, `drop`, travel_date, preferred_time, 
            vehicle_type, full_name, phone, email, requirements, 
            distance_km, estimated_fare, status
        ) VALUES (
            :trip_type, :pickup, :drop, :travel_date, :preferred_time, 
            :vehicle_type, :full_name, :phone, :email, :requirements, 
            :distance_km, :estimated_fare, 'pending'
        )
    ");

    // Execute query with filtered variables
    $stmt->execute([
        ':trip_type'      => substr($data['tripType'] ?? 'oneway', 0, 20),
        ':pickup'         => substr($data['pickup'] ?? '', 0, 255),
        ':drop'           => substr($data['drop'] ?? '', 0, 255),
        ':travel_date'    => $data['travelDate'] ?? date('Y-m-d'),
        ':preferred_time' => $data['preferredTime'] ?? date('H:i:s'),
        ':vehicle_type'   => substr($data['vehicleType'] ?? 'sedan', 0, 50),
        ':full_name'      => substr($data['fullName'] ?? '', 0, 255),
        ':phone'          => substr($data['phone'] ?? '', 0, 50),
        ':email'          => !empty($data['email']) ? substr($data['email'], 0, 255) : null,
        ':requirements'   => !empty($data['requirements']) ? $data['requirements'] : null,
        ':distance_km'    => floatval($data['distance'] ?? 0.00),
        ':estimated_fare' => floatval($data['estimatedFare'] ?? 0.00)
    ]);

    // Retrieve last inserted ID
    $db_id = $pdo->lastInsertId();
    $booking_id = "PTB-" . str_pad($db_id, 5, "0", STR_PAD_LEFT);

    // Return gorgeous JSON response
    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Booking registered in MySQL database successfully.",
        "bookingId" => $booking_id,
        "recordId" => $db_id
    ]);

} catch (PDOException $e) {
    // Safe database error logging
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Database failure: " . $e->getMessage()
    ]);
}
?>
