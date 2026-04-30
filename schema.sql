-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Enum Types (Optional, but good for strict typing in Postgres)
CREATE TYPE body_size_enum AS ENUM ('BIG', 'MEDIUM', 'LARGE');
CREATE TYPE behavior_enum AS ENUM ('GOOD', 'NO BAD', 'BAD', 'VERY BAD');
CREATE TYPE service_timing_enum AS ENUM ('1 HOUR', '2 HOUR', '3 HOUR');

-- Create Customers Table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT,
    nationality TEXT,
    amount_aed NUMERIC(10, 2),
    staff_commission NUMERIC(10, 2),
    staff_name TEXT,
    body_size body_size_enum,
    behavior behavior_enum,
    service_timing service_timing_enum,
    service_date DATE,
    service_time TIME,
    room_number TEXT,
    repeat_customer BOOLEAN DEFAULT false,
    mallu_customer BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Create Indexes for faster filtering
CREATE INDEX idx_customers_service_date ON customers(service_date);
CREATE INDEX idx_customers_staff_name ON customers(staff_name);
CREATE INDEX idx_customers_nationality ON customers(nationality);
