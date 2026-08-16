# Ingres Copilot: AI Groundwater Intelligence Assistant

Ingres Copilot is a premium SaaS web application designed to provide government-grade intelligence for groundwater monitoring and analysis. Built with modern web technologies, it offers a secure, scalable, and visually stunning interface for hydrologists and decision-makers.

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** Shadcn UI
- **Animations:** Framer Motion
- **Icons:** Lucide React

## Features
- **Modern Government-Grade Aesthetic:** A professional deep navy and vibrant cyan color scheme.
- **Glassmorphism:** Subtle, hardware-accelerated glass effects for a premium feel.
- **Smooth Animations:** Integrated page and section transitions using Framer Motion.
- **Responsive Design:** Mobile-first architecture ensuring usability across all devices.
- **Client-Side Validation:** Form validation for authentication flows (Login/Register).

## Project Structure
- `/src/app/globals.css`: Contains the core design system tokens (colors, fonts, radius) and custom Tailwind utilities (e.g., `.glass`).
- `/src/app/layout.tsx`: Global layout enforcing dark mode and wrapping content in the Navbar and Footer.
- `/src/app/page.tsx`: The primary Landing Page showcasing the hero section, capabilities, and architecture overview.
- `/src/app/login/page.tsx`: The login interface with mock authentication.
- `/src/app/register/page.tsx`: The registration interface tailored for agency access requests.
- `/src/components/`: Reusable components including the global `Navbar` and `Footer`.
- `/src/components/ui/`: Base Shadcn components (`button`, `card`, `input`, `label`).

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm
- Python 3.10+

### Installation & Setup

#### Frontend Setup
1. Clone the repository or navigate to the project directory:
   ```bash
   cd IngresCopilot
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```

#### Backend Setup
The backend uses a Domain-Driven (Modular) architecture using FastAPI.
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Configure environment variables:
   Ensure you have copied `.env.example` to `.env` in the **root of the project** and updated the MongoDB URI, JWT Secret, and GROQ_API_KEY.

#### Phase 4: REAL RAG Ingestion Pipeline
The AI Assistant uses a Retrieval-Augmented Generation (RAG) system grounded in official CGWB PDFs and CSVs. It strictly answers using retrieved context.
1. Drop your official `.pdf` and `.csv` groundwater datasets into the `backend/ingestion/` folder.
2. Run the batch ingestion script to build the local ChromaDB vector database:
   ```bash
   # Ensure you are inside the backend/ folder and the virtual environment is activated
   python -m app.rag.ingest
   ```
   *Note: The system hashes files to prevent duplicate ingestion, extracts structured metadata, and embeds text locally using `sentence-transformers/all-MiniLM-L6-v2`.*

### Running Locally

You need to run both the frontend and backend servers.

**Terminal 1 (Frontend):**
```bash
# from root directory
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

**Terminal 2 (Backend):**
```bash
# from backend directory
uvicorn app.main:app --reload
```
The API will be available at `http://localhost:8000`.
You can view the interactive Swagger documentation at `http://localhost:8000/docs`.

## Future Roadmap
- Integration with real authentication providers (e.g., Supabase, NextAuth).
- Backend connection to real geospatial and sensor data lakes.
- Implementation of the dynamic Architecture diagram.
- Dashboard analytics view post-login.
