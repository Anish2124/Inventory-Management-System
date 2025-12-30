Chemical Inventory Management System

1. Project Overview
The Chemical Inventory Management System is a full stack web application designed to manage chemical products and track inventory in real time. The system supports complete CRUD operations, stock movement tracking, and historical audit logs while ensuring data consistency and preventing negative stock scenarios.
Purpose
•	Manage chemical products with unique CAS numbers
•	Track inventory using IN / OUT stock movements
•	Maintain stock movement history for auditing
•	Enable fast search and filtering
•	Ensure data integrity using validations and database constraints
________________________________________
2. Architecture & Technology Stack
Backend
•	Runtime: Node.js
•	Framework: Express.js
•	Database: PostgreSQL
•	DB Client: pg (native PostgreSQL client)
•	Configuration: dotenv
Frontend
•	Framework: React 18 with TypeScript
•	Build Tool: Vite
•	UI Library: Material UI (MUI v5)
•	State Management: React Hooks
________________________________________
3. Application Setup
Prerequisites
•	Node.js v14+
•	PostgreSQL v12+
•	npm or yarn
Database Setup
CREATE DATABASE inventory_db;

Backend Setup
cd backend
npm install
npm start

Frontend Setup
cd frontend
npm install
npm run dev
________________________________________
4. Database Design
Tables
4.1 chemical_products
Stores master data for chemical products.

Column	            Type	        Description
id	                SERIAL	      Primary key
product_name	      VARCHAR      	Product name
cas_number	        VARCHAR	      Unique CAS number
unit_of_measurement	VARCHAR      	KG / MT / Litre
created_at	        TIMESTAMP    	Creation timestamp
updated_at         	TIMESTAMP	    Update timestamp
________________________________________
4.2 inventory
Maintains current stock for each product.

Column                   	Type        	Description
id	                      SERIAL	       Primary key
product_id	              INTEGER	FK → chemical_products
current_stock_quantity	  DECIMAL	      Current stock
created_at	              TIMESTAMP    	Creation timestamp
updated_at	              TIMESTAMP    	Update timestamp

________________________________________
4.3 stock_movements
Tracks complete stock movement history.

Column	          Type	        Description
id	              SERIAL	      Primary key
product_id	      INTEGER	FK → chemical_products
movement_type     VARCHAR	       IN / OUT
quantity	        DECIMAL	      Movement quantity
previous_stock	  DECIMAL        Stock before change
new_stock	        DECIMAL	       Stock after change
created_at	      TIMESTAMP	     Movement timestamp
________________________________________
Conclusion:
This system provides a scalable, secure, and maintainable solution for chemical inventory management. Its layered validation, transactional integrity, and modular architecture make it suitable for real world enterprise use cases.

