-- Create order_history table
CREATE TABLE IF NOT EXISTS order_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    order_id VARCHAR(64) NOT NULL,
    status VARCHAR(16) NOT NULL CHECK (status IN ('abandoned', 'pending', 'paid', 'cancelled')),
    order_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for quick lookup
CREATE INDEX IF NOT EXISTS idx_order_history_user_id ON order_history(user_id);
CREATE INDEX IF NOT EXISTS idx_order_history_order_id ON order_history(order_id);

-- Enable RLS
ALTER TABLE order_history ENABLE ROW LEVEL SECURITY;

-- Policy: Only allow users to see their own order history
CREATE POLICY "Users can view their own order history" ON order_history
    FOR SELECT USING (auth.uid()::uuid = user_id);

-- Policy: Only allow users to insert their own order history (for webhooks, can be more permissive if needed)
CREATE POLICY "Users can insert their own order history" ON order_history
    FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

-- Policy: Only allow users to update their own order history
CREATE POLICY "Users can update their own order history" ON order_history
    FOR UPDATE USING (auth.uid()::uuid = user_id); 