-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    status TEXT NOT NULL,
    midtransOrderId TEXT UNIQUE NOT NULL,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own transactions
CREATE POLICY "Users can read their own transactions" ON public.transactions
    FOR SELECT
    USING (auth.uid() = userId);

-- Create policy to allow users to create their own transactions
CREATE POLICY "Users can create their own transactions" ON public.transactions
    FOR INSERT
    WITH CHECK (auth.uid() = userId);

-- Create policy to allow users to update their own transactions
CREATE POLICY "Users can update their own transactions" ON public.transactions
    FOR UPDATE
    USING (auth.uid() = userId);

-- Create policy to allow users to delete their own transactions
CREATE POLICY "Users can delete their own transactions" ON public.transactions
    FOR DELETE
    USING (auth.uid() = userId);
