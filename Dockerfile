FROM python:3.12-slim

# Install system dependencies including Node.js and basic build tools
RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the entire project
COPY . /app

# Build the React frontend
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Setup the Python backend
WORKDIR /app
# Install PyTorch index first (optional but helps ensure correct CPU version if needed, or use default from requirements.txt)
RUN pip install --no-cache-dir -r requirements.txt

# Create necessary directories
RUN mkdir -p data/raw

# Expose the default port for Hugging Face Spaces
EXPOSE 7860

# Command to run the application (Hugging Face routes traffic to 7860)
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
