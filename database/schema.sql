-- Digital Complaint Management & Grievance Portal
-- Database Schema (MySQL - Maximum 2 Tables)

-- Create database
CREATE DATABASE IF NOT EXISTS complaint_portal;
USE complaint_portal;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('User', 'Staff', 'Admin') NOT NULL DEFAULT 'User',
  contact_info VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  staff_id INT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('plumbing', 'electrical', 'facility', 'other') NOT NULL,
  status ENUM('Open', 'Assigned', 'In-progress', 'Resolved') DEFAULT 'Open',
  attachments VARCHAR(500) NULL,
  resolution_notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert sample staff and admin users (optional)
INSERT INTO users (name, email, password, role, contact_info) VALUES
('Admin User', 'admin@portal.com', 'admin', 'Admin', '1234567890'),
('Staff Member', 'staff@portal.com', '$2a$10$xxxxxxxxxxx', 'Staff', '0987654321');
