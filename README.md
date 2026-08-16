# Ingres Copilot: AI Groundwater Intelligence Assistant

Ingres Copilot is a premium, government-grade SaaS web application designed to provide predictive intelligence and analytics for groundwater monitoring. Built with a modern technology stack, it offers a secure, scalable, and visually stunning interface for hydrologists, researchers, and government decision-makers.

## 🚀 Key Features

- **Role-Based Access Control (RBAC):** Tailored dashboards and access levels for Public Users, Researchers, Government Officers, and System Administrators.
- **Interactive Geospatial Mapping:** India state-level polygon mapping with Leaflet, visualizing groundwater assessment unit categorizations (Critical, Over-Exploited, Safe).
- **Retrieval-Augmented Generation (RAG) AI Assistant:** A specialized chatbot that securely parses official CGWB PDF reports and CSV datasets using ChromaDB to answer complex hydrology questions.
- **Automated Document Ingestion:** Intelligent backend pipelines that hash and embed PDF reports to power the AI Assistant.
- **Dynamic Dashboards & Analytics:** Fully glassmorphic UI displaying real-time metrics, system health, and extraction stage charts.
- **Premium Aesthetics:** Sleek dark-mode interface with vibrant cyan/purple gradients, framer-motion animations, and custom glass-card styling.

## 🛠️ Technology Stack

**Frontend**
- Next.js 15 (App Router)
- React & TypeScript
- Tailwind CSS v4 & Framer Motion
- Shadcn UI & Lucide React Icons
- React-Leaflet (Interactive Maps)

**Backend**
- Python 3.10+ & FastAPI
- MongoDB (User authentication, analytics caching, role data)
- ChromaDB (Vector database for RAG document embeddings)
- Sentence-Transformers (`all-MiniLM-L6-v2`) & Groq API
- PyJWT & passlib (Authentication & Hashing)

---

## ⚙️ Getting Started & Installation

Follow these step-by-step instructions to set up and run the Ingres Copilot application locally.

### Prerequisites

Ensure you have the following installed on your system:
- **Node.js** (v18 or higher)
- **npm** (Node Package Manager)
- **Python** (v3.10 or higher)
- **MongoDB** (Running locally on `mongodb://localhost:27017/` or via MongoDB Atlas)

---

### Step 1: Clone the Repository
```bash
git clone <repository_url>
cd IngresCopilot
```

### Step 2: Environment Configuration
Create a `.env` file in the **root of your project** and add the following keys. (You can use `.env.example` as a template).

```env
# MongoDB Connection
MONGODB_URI="mongodb://localhost:27017/"

# Security
JWT_SECRET="your_super_secret_jwt_key_here"

# AI Inference (Required for RAG Assistant)
GROQ_API_KEY="your_groq_api_key_here"
```

---

### Step 3: Backend Setup (FastAPI & AI)

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   - **Windows:**
     ```bash
     python -m venv venv
     venv\Scripts\activate
     ```
   - **Mac/Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Seed the Database with Demo Users (Required for Login):**
   Run the seeding script to create the default Admin, Researcher, and Government Officer accounts.
   ```bash
   python seed_demo_users.py
   ```

5. **(Optional) Ingest Document Data for the AI Assistant:**
   Place your official `.pdf` and `.csv` datasets into the `backend/ingestion/` folder, then run the RAG ingestor to populate the local ChromaDB vector database.
   ```bash
   python -m app.rag.ingest
   ```

6. **Start the Backend Server:**
   ```bash
   uvicorn app.main:app --reload
   ```
   *The backend will now be running at `http://localhost:8000`. You can view the API documentation at `http://localhost:8000/docs`.*

---

### Step 4: Frontend Setup (Next.js)

1. **Open a new terminal and navigate to the project root:**
   ```bash
   cd IngresCopilot
   ```

2. **Install Node modules:**
   ```bash
   npm install
   ```

3. **Start the Frontend Development Server:**
   ```bash
   npm run dev
   ```
   *The frontend will now be running at `http://localhost:3000`.*

---

## 🖥️ How to Use the Application

1. Open your browser and navigate to `http://localhost:3000`.
2. Click **Start Monitoring** to view the login portal.
3. Use the **Quick Demo Access** buttons to instantly log in as different roles:
   - **Admin:** Has access to the Admin Setup Control Center.
   - **Government Officer:** Sees policy tracking and critical national alerts.
   - **Researcher:** Views AI insights and saved citations.
   - **Public:** Bypasses authentication for limited "Guest Mode" access.
4. Navigate using the left sidebar to explore the Interactive Map, AI Assistant, Analytics, and Document Summarizer!

## 🔐 Security & Data Flow
- All user passwords are encrypted using `bcrypt`.
- Authentication uses secure `HttpOnly` cookies and JWT Access tokens.
- Map and AI requests are protected by API dependencies that verify the JWT and enforce RBAC rules before returning sensitive groundwater datasets.
