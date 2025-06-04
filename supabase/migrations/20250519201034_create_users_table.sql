-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    passwordHash TEXT NOT NULL,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own data
CREATE POLICY "Users can read their own data" ON public.users
    FOR SELECT
    USING (auth.uid() = id);

-- Create policy to allow users to update their own data
CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE
    USING (auth.uid() = id);

-- Create policy to allow users to delete their own data
CREATE POLICY "Users can delete their own data" ON public.users
    FOR DELETE
    USING (auth.uid() = id);
