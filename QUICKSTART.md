# Quickstart Guide

## Prerequisites
- Windows / Linux
- Python 3.12+
- Node.js 18+

## 1. Setup the AI Backend
```bash
python -m venv venv
.\venv\Scripts\Activate.ps1   # On Windows
# source venv/bin/activate    # On Linux

pip install -r requirements.txt
```

## 2. Generate Dev Datasets
We dynamically generate local GeoTIFFs to test pipelines without downloading 100GB of BigEarthNet.
```bash
python scripts/download_dev_subset.py
python scripts/verify_datasets.py
```

## 3. Run the E2E Demo
This script spins up the FastAPI backend and provides instructions to start the frontend.
```bash
python scripts/run_demo.py
```

## 4. Start the Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.
