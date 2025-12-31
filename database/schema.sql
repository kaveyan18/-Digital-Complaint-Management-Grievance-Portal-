-- Digital Complaint Management & Grievance Portal
-- Database Schema

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
  complaint_unique_id VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('plumbing', 'electrical', 'facility', 'other') NOT NULL,
  status ENUM('Open', 'Assigned', 'In-progress', 'Resolved') DEFAULT 'Open',
  attachments VARCHAR(500) NULL,
  resolution_notes TEXT NULL,
  resolution_attachments VARCHAR(500) NULL,
  rating INT NULL,
  feedback TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample staff and admin users
-- Password for both is: admin123
INSERT INTO users (name, email, password, role, contact_info) VALUES
('Admin User', 'admin@portal.com', '$2a$10$a0FHAEb/qzhL2t2QUVmb4Oub/cruNHEunuXfoto7B18Kw.ZPcltma', 'Admin', '1234567890'),
('Staff Member', 'staff@portal.com', '$2a$10$a0FHAEb/qzhL2t2QUVmb4Oub/cruNHEunuXfoto7B18Kw.ZPcltma', 'Staff', '0987654321');