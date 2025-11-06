

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt


echo ""
echo "✅ Backend setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Update .env with your API keys (Supabase, OpenWeather)"
echo "   2. Ensure your model file is in the models/ directory"
echo "   3. Set up your Supabase database using database/schema.sql"
echo "   4. Run: python app.py"
echo ""
echo "🚀 To start the server:"
echo "   source venv/bin/activate"
echo "   python app.py"



ip : ipconfig getifaddr en0 
