-- Create photos table in Supabase
CREATE TABLE IF NOT EXISTS photos (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for photos (run this in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true);

-- Set up Row Level Security policies
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read photos
CREATE POLICY "Allow public read access" ON photos
  FOR SELECT USING (true);

-- Allow anyone to insert photos
CREATE POLICY "Allow public insert access" ON photos
  FOR INSERT WITH CHECK (true);
