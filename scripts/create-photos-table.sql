
CREATE TABLE IF NOT EXISTS photos (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on photos table
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read photos
CREATE POLICY "Allow public read access" ON photos
  FOR SELECT USING (true);

-- Policy: Allow anyone to insert photos
CREATE POLICY "Allow public insert access" ON photos
  FOR INSERT WITH CHECK (true);



