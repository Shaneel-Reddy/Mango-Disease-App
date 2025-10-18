-- Create predictions table
CREATE TABLE IF NOT EXISTS predictions (
    id BIGSERIAL PRIMARY KEY,
    disease TEXT NOT NULL,
    confidence FLOAT NOT NULL,
    latitude FLOAT,
    longitude FLOAT,
    region TEXT,
    temperature FLOAT,
    humidity FLOAT,
    season TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create pest_risk table
CREATE TABLE IF NOT EXISTS pest_risk (
    id SERIAL PRIMARY KEY,
    disease TEXT NOT NULL,
    region TEXT NOT NULL,
    start_month INTEGER NOT NULL CHECK (start_month >= 1 AND start_month <= 12),
    end_month INTEGER NOT NULL CHECK (end_month >= 1 AND end_month <= 12),
    description TEXT,
    severity TEXT CHECK (severity IN ('Low', 'Medium', 'High')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_predictions_timestamp ON predictions(timestamp DESC);
CREATE INDEX idx_predictions_disease ON predictions(disease);
CREATE INDEX idx_predictions_region ON predictions(region);
CREATE INDEX idx_pest_risk_region ON pest_risk(region);
CREATE INDEX idx_pest_risk_disease ON pest_risk(disease);

-- Insert sample pest risk data
INSERT INTO pest_risk (disease, region, start_month, end_month, description, severity) VALUES
('Anthracnose', 'Tamil Nadu, India', 6, 9, 'High humidity during monsoon favors anthracnose development. Apply copper-based fungicides preventively.', 'High'),
('Anthracnose', 'Karnataka, India', 6, 9, 'Monitor rainfall and apply protective fungicides during wet periods.', 'High'),
('Powdery Mildew', 'Maharashtra, India', 10, 2, 'Cool dry weather after monsoon promotes powdery mildew. Use sulfur-based sprays.', 'Medium'),
('Powdery Mildew', 'Gujarat, India', 10, 2, 'Apply preventive sprays during flowering season.', 'Medium'),
('Bacterial Canker', 'Andhra Pradesh, India', 3, 5, 'Prune infected branches and apply copper sprays before summer rains.', 'Medium'),
('Die Back', 'Tamil Nadu, India', 3, 5, 'Hot dry weather can trigger die back. Ensure proper irrigation and nutrition.', 'Medium'),
('Gall Midge', 'Kerala, India', 6, 8, 'Peaks during monsoon. Remove and destroy affected inflorescence.', 'High'),
('Sooty Mould', 'Tamil Nadu, India', 6, 9, 'Follows scale insect infestation. Control scale insects to prevent sooty mould.', 'Low'),
('Cutting Weevil', 'Karnataka, India', 2, 4, 'Active during flowering. Remove and destroy affected shoots.', 'Medium');

-- Enable Row Level Security (optional, for production)
-- ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE pest_risk ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your authentication setup)
-- CREATE POLICY "Enable read access for all users" ON predictions FOR SELECT USING (true);
-- CREATE POLICY "Enable insert for all users" ON predictions FOR INSERT WITH CHECK (true);
