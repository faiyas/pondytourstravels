-- --------------------------------------------------------
-- Host: 103.191.209.67 (MySQL Server)
-- Database Name: pondytou1_tourstravels
-- Table Structure for 'bookings'
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `bookings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `trip_type` VARCHAR(20) NOT NULL COMMENT 'oneway or round',
  `pickup` VARCHAR(255) NOT NULL COMMENT 'Pickup location name',
  `drop` VARCHAR(255) NOT NULL COMMENT 'Destination location name',
  `travel_date` DATE NOT NULL COMMENT 'Selected date of travel',
  `preferred_time` TIME NOT NULL COMMENT 'Preferred time of travel',
  `vehicle_type` VARCHAR(50) NOT NULL COMMENT 'sedan, muv, innova, crysta',
  `full_name` VARCHAR(255) NOT NULL COMMENT 'Customer full name',
  `phone` VARCHAR(50) NOT NULL COMMENT 'Customer contact number',
  `email` VARCHAR(255) DEFAULT NULL COMMENT 'Optional email address',
  `requirements` TEXT DEFAULT NULL COMMENT 'Optional special requirements',
  `distance_km` DECIMAL(10, 2) NOT NULL DEFAULT '0.00' COMMENT 'Driving distance in kilometers',
  `estimated_fare` DECIMAL(10, 2) NOT NULL DEFAULT '0.00' COMMENT 'Computed estimated fare amount in INR',
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'pending, confirmed, cancelled',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_travel_date` (`travel_date`),
  INDEX `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
