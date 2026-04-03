create database e_payment_system
use e_payment_system
CREATE TABLE users (
id INT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100),
email VARCHAR(150),
role VARCHAR(50),
password VARCHAR(200),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users 
ADD COLUMN username VARCHAR(100) UNIQUE AFTER id;

ALTER TABLE users 
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- ALTER TABLE users
-- ADD warehouse_id INT,
-- ADD FOREIGN KEY (role_id) REFERENCES roles(id),
ALTER TABLE users
ADD FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id);


ALTER TABLE users
ADD role_id INT,
ADD FOREIGN KEY (role_id) REFERENCES roles(id);

INSERT INTO users (name,email,role,password)
VALUES ('Ranjeet','ranjeet@test.com','Admin','123');

CREATE TABLE vendors (
id INT PRIMARY KEY AUTO_INCREMENT,
vendor_id VARCHAR(20) UNIQUE,

vendor_name VARCHAR(200),

gst_number VARCHAR(50),
pan_number VARCHAR(50),

address_line1 VARCHAR(200),
address_line2 VARCHAR(200),
city VARCHAR(100),
state VARCHAR(100),
pincode VARCHAR(20),
country VARCHAR(100),

contact_person VARCHAR(150),
contact_phone VARCHAR(20),
email VARCHAR(150),

bank_name VARCHAR(150),
account_number VARCHAR(50),
ifsc_code VARCHAR(20),

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- DROP TRIGGER IF EXISTS before_insert_vendors;
-- CREATE TRIGGER before_insert_vendors
-- BEFORE INSERT ON vendors
-- FOR EACH ROW
-- SET NEW.vendor_id = CONCAT('VD', LPAD((SELECT AUTO_INCREMENT 
-- FROM information_schema.TABLES 
-- WHERE TABLE_NAME = 'vendors'),4,'0'));

CREATE TRIGGER before_insert_vendors
BEFORE INSERT ON vendors
FOR EACH ROW SET NEW.vendor_id =CONCAT('VD',LPAD((SELECT AUTO_INCREMENT
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'vendors'),2,'0'));

DROP trigger before_insert_vendors
use e_payment_system

INSERT INTO vendors 
(vendor_name, contact_person_name, contact_person_mobile, gst_number, address)
VALUES 
('ABC Traders','Ramesh','9876543210','27ABCDE1234F1Z5','Delhi');


CREATE TABLE warehouses (
id INT PRIMARY KEY AUTO_INCREMENT,
warehouse_id VARCHAR(20) UNIQUE,

warehouse_name VARCHAR(150),

address_line1 VARCHAR(200),
address_line2 VARCHAR(200),
city VARCHAR(100),
state VARCHAR(100),
pincode VARCHAR(20),
country VARCHAR(100),
contact_person VARCHAR(150),
contact_phone VARCHAR(20),
email VARCHAR(150),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- use e_payment_system
-- DROP TRIGGER IF EXISTS before_insert_warehouses;
CREATE TRIGGER before_insert_warehouses
BEFORE INSERT ON warehouses
FOR EACH ROW
SET NEW.warehouse_id =
CONCAT('WH',LPAD((SELECT AUTO_INCREMENT 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'warehouses'),2,'0'));





CREATE TABLE payment_requests (
id INT PRIMARY KEY AUTO_INCREMENT,
request_code VARCHAR(30) UNIQUE,   -- Example PR-WH001-00001
vendor_id INT,
warehouse_id INT,
created_by INT,
status VARCHAR(50),                -- Draft / Submitted / Approved / Rejected / Paid
current_level INT DEFAULT 0,       -- Workflow level pointer
grand_total DECIMAL(14,2),
reject_reason TEXT,
submitted_at DATETIME,
approved_at DATETIME,
paid_at DATETIME,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,



FOREIGN KEY (vendor_id) REFERENCES vendors(id),
FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
FOREIGN KEY (created_by) REFERENCES users(id)
);
DROP TABLE payment_requests

use e_payment_system
ALTER TABLE payment_requests
MODIFY warehouse_id INT,
MODIFY created_by INT

-- ALTER TABLE payment_requests 
-- MODIFY current_level INT DEFAULT 1;

-- ALTER TABLE payment_requests 
-- MODIFY status VARCHAR(50) DEFAULT 'Draft';

DROP TRIGGER IF EXISTS before_insert_payment_requests;

DROP TRIGGER IF EXISTS before_insert_payment_requests;

DELIMITER $$

CREATE TRIGGER before_insert_payment_requests
BEFORE INSERT ON payment_requests
FOR EACH ROW
BEGIN

SET NEW.request_code = CONCAT(
'PR',
LPAD(
(SELECT IFNULL(MAX(id),0) + 1 FROM payment_requests),
5,
'0'
)
);

END$$

DELIMITER ;

INSERT INTO payment_requests
(vendor_id, warehouse_id, created_by, status, grand_total)
VALUES (1,1,1,'Draft',1000);
INSERT INTO users (id, name)
VALUES (1,'Ranjeet');

INSERT INTO payment_requests
(vendor_id, warehouse_id, created_by, status, grand_total)
VALUES (1,1,1,'Draft',1000);


CREATE TABLE invoices (
id INT PRIMARY KEY AUTO_INCREMENT,

payment_request_id INT,

invoice_no VARCHAR(100),
invoice_date DATE,

gst_percent DECIMAL(5,2),

subtotal DECIMAL(14,2),
gst_amount DECIMAL(14,2),
total_amount DECIMAL(14,2),

FOREIGN KEY (payment_request_id) REFERENCES payment_requests(id)
);

workflow_config
CREATE TABLE invoice_items (
id INT PRIMARY KEY AUTO_INCREMENT,

invoice_id INT,

description VARCHAR(250),
qty INT,
price DECIMAL(12,2),
total DECIMAL(14,2),

FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

CREATE TABLE attachments (
id INT PRIMARY KEY AUTO_INCREMENT,

invoice_id INT,
file_path VARCHAR(300),

uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);


CREATE TABLE workflow_config (
id INT PRIMARY KEY AUTO_INCREMENT,

warehouse_id INT,
level_no INT,
role VARCHAR(50),

FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);
CREATE TABLE approval_logs (
id INT PRIMARY KEY AUTO_INCREMENT,
payment_request_id INT,
approved_by INT,
level_no INT,
status VARCHAR(50),
remarks TEXT,
action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (payment_request_id) REFERENCES payment_requests(id),
FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- CREATE TABLE roles (
-- id INT PRIMARY KEY AUTO_INCREMENT,
-- role_name VARCHAR(50) UNIQUE
-- );

-- ALTER TABLE roles 
-- ADD role_id int,
-- ADD created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- Select *from roles


CREATE TABLE user_warehouses (
id INT PRIMARY KEY AUTO_INCREMENT,
user_id INT,
warehouse_id INT,

FOREIGN KEY (user_id) REFERENCES users(id),
FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

CREATE TABLE approval_levels (
id INT PRIMARY KEY AUTO_INCREMENT,
level_no INT,
role_id INT,
description VARCHAR(100),

FOREIGN KEY (role_id) REFERENCES roles(id)
);


CREATE TABLE payment_approvals (
id INT PRIMARY KEY AUTO_INCREMENT,

payment_request_id INT,
level_no INT,
approved_by INT,

status VARCHAR(50),
remarks TEXT,

action_at DATETIME,

FOREIGN KEY (payment_request_id) REFERENCES payment_requests(id),
FOREIGN KEY (approved_by) REFERENCES users(id)
);
