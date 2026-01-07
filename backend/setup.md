# Backend Setup Guide

This guide helps you reinstall the backend dependencies after deletion to save space. You can safely delete the `venv` directory and reinstall later using these steps.

## Prerequisites

- Python 3.8 or higher
- pip package manager

## Reinstallation Steps

1. **Navigate to the backend directory**:

   ```bash
   cd backend
   ```

2. **Create a new virtual environment**:

   ```bash
   python3 -m venv venv
   ```

3. **Activate the virtual environment**:

   ```bash
   source venv/bin/activate
   ```

4. **Upgrade pip**:

   ```bash
   pip install --upgrade pip
   ```

5. **Install Python dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

6. **Configure environment variables**:
   Create a `.env` file in the backend directory with:

   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_anon_key
   OPENWEATHER_API_KEY=your_openweathermap_api_key
   MODEL_PATH=models/mango_disease_model.h5
   PORT=5000
   ```

7. **Ensure model files are present**:

   - Place your trained ML models in the `models/` directory
   - The app uses `DenseNet-121.pth` and `Hybrid_Model.pth`

8. **Set up the database**:

   - Create a Supabase project at https://supabase.com
   - Run the SQL script from `database/schema.sql` in the Supabase SQL Editor

9. **Start the Flask server**:
   ```bash
   python app.py
   ```

The API will be available at `http://localhost:5000`

## Notes

- Always activate the virtual environment before running the app
- Keep your `.env` file secure and don't commit it to version control
- The setup script `setup.sh` can also be used to automate steps 2-5</content>
  <parameter name="filePath">/Users/shaneel/Dev/Research Paper/Mango-Disease-App/backend/setup.md
