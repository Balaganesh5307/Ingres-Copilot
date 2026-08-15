# Ingres Copilot Backend

This is the FastAPI backend for the Ingres Copilot platform.

## Architecture
The backend uses a Domain-Driven (Modular) architecture:
- `app/main.py`: Entrypoint for the application
- `app/core/`: Configuration and database connection setup
- `app/api/v1/router.py`: Aggregates all module routers
- `app/modules/`: Contains business logic divided by domains (auth, documents, users, etc.)

## Setup

1. Create a virtual environment and install dependencies:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. Configure environment variables:
Ensure you have copied `.env.example` to `.env` and updated the MongoDB URI and JWT Secret.

3. Run the development server:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.
You can view the interactive Swagger documentation at `http://localhost:8000/docs`.
