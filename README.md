
Chemical Inventory Management System

Project Overview
The Chemical Inventory Management System is a full stack web application designed to manage chemical products and track inventory in real time.
It supports CRUD operations, stock movement tracking, and historical audit logs while ensuring data consistency and preventing negative stock.

Purpose
- Manage chemical products with unique CAS numbers
- Track inventory using IN / OUT stock movements
- Maintain stock movement history for auditing
- Enable fast search and filtering
- Ensure data integrity using validations and database constraints

--------------------------------------------------

Architecture & Technology Stack

Backend
- Runtime: Node.js
- Framework: Express.js
- Database: PostgreSQL
- DB Client: pg
- Configuration: dotenv

Frontend
- Framework: React 18 with TypeScript
- Build Tool: Vite
- UI Library: Material UI (MUI v5)
- State Management: React Hooks

--------------------------------------------------

Application Setup

Prerequisites
- Node.js v14+
- PostgreSQL v12+
- npm or yarn

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

--------------------------------------------------

Database Design

Table: chemical_products  
Stores master data for chemical products.

| Column Name           | Data Type  | Description            |
|-----------------------|------------|------------------------|
| id                    | SERIAL     | Primary key            |
| product_name          | VARCHAR    | Product name           |
| cas_number            | VARCHAR    | Unique CAS number      |
| unit_of_measurement   | VARCHAR    | KG / MT / Litre        |
| created_at            | TIMESTAMP  | Creation timestamp     |
| updated_at            | TIMESTAMP  | Update timestamp       |

--------------------------------------------------

Table: inventory  
Maintains current stock for each product.

| Column Name               | Data Type | Description                          |
|---------------------------|-----------|--------------------------------------|
| id                        | SERIAL    | Primary key                          |
| product_id                | INTEGER   | FK → chemical_products               |
| current_stock_quantity    | DECIMAL   | Current stock                        |
| created_at                | TIMESTAMP | Creation timestamp                   |
| updated_at                | TIMESTAMP | Update timestamp                     |


--------------------------------------------------

Stock Movements Table  
Tracks complete stock movement history.

| Column         | Type      | Description              |
|---------------|-----------|--------------------------|
| id            | SERIAL    | Primary key              |
| product_id    | INTEGER   | FK → chemical_products   |
| movement_type | VARCHAR   | IN / OUT                 |
| quantity      | DECIMAL   | Movement quantity        |
| previous_stock| DECIMAL   | Stock before change      |
| new_stock     | DECIMAL   | Stock after change       |
| created_at    | TIMESTAMP | Movement timestamp       |


--------------------------------------------------

Conclusion
This system provides a scalable and maintainable solution for chemical inventory management.
It ensures data integrity, proper stock tracking, and is suitable for real-world use.

Developed By
Anish Wavikar
