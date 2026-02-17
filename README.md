# SOC Benchmarking Framework

A comprehensive, web-based framework for evaluating, benchmarking, and comparing SOC (Security Operations Center) solutions such as Palo Alto, Fortinet, and CrowdStrike. This tool facilitates both hands-on lab testing and theoretical evaluation, providing detailed scoring, ranking, and visual analytics.

> [!NOTE]
> This project features **two backend implementations**: **Node.js (Primary)** and **Python (Alternative)**. The Docker setup defaults to the Node.js backend.

## 🚀 Features

-   **Dynamic Scoring Engine**: Evaluate solutions against 8 key categories (Detection, Response, Deployment, etc.).
-   **Visual Analytics**: Interactive radar charts, heatmaps, and mitigation coverage visualizations.
-   **Comparison & Ranking**: Side-by-side solution comparison with weighted scoring and automatic ranking.
-   **Dual Evaluation Modes**: specialized workflows for "Hands-on Lab" testing vs. "Theoretical" research.
-   **MITRE ATT&CK Mapping**: Automatic calculation of coverage against the MITRE framework.
-   **Report Generation**: Export detailed benchmark reports to PDF.

## 🛠️ Technology Stack

### Frontend
-   **Framework**: [React 18](https://react.dev/)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/), [class-variance-authority](https://cva.style/)
-   **UI Components**: [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/) (Icons)
-   **Visualization**: [Chart.js](https://www.chartjs.org/), [React-Chartjs-2](https://react-chartjs-2.js.org/)
-   **Utilities**: [Axios](https://axios-http.com/), [jsPDF](https://github.com/parallax/jsPDF)

### Backend (Primary - Node.js)
-   **Runtime**: [Node.js](https://nodejs.org/)
-   **Framework**: [Express.js](https://expressjs.com/)
-   **Storage**: JSON-based flat file database (NoSQL-like)
-   **Validation**: UUID generation

### Backend (Alternative - Python)
-   **Runtime**: Python 3.11+
-   **Framework**: [Flask](https://flask.palletsprojects.com/)
-   **Storage**: JSON-based flat file database (Compatible with Node.js backend)

---

## 📦 Installation & Setup

### Method 1: Docker (Recommended)
The easiest way to run the full stack. This launches the **Node.js** backend and React frontend.

1.  **Prerequisites**: Ensure Docker and Docker Compose are installed.
2.  **Run**:
    ```bash
    docker-compose up --build
    ```
3.  **Access**:
    -   Frontend: `http://localhost:5173`
    -   Backend API: `http://localhost:5000`

### Method 2: Manual Setup (Node.js Backend)
Use this if you prefer a standard JavaScript development workflow.

#### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
*Server runs at `http://localhost:5000`*

#### 2. Frontend Setup
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at `http://localhost:5173`*

### Method 3: Manual Setup (Python Backend)
Use this if you prefer the Python ecosystem or need to run the specific Python logic.

#### 1. Backend Setup
```bash
cd backend
# Install dependencies
pip install -r requirements.txt

# Run the Flask server
python app.py
```
*Server runs at `http://localhost:5000`*

#### 2. Frontend Setup
Proceed with the same frontend steps as above (Method 2, Step 2). The frontend is agnostic to which backend is running as long as it listens on port 5000.

---

## 📂 Project Structure

```bash
bench-framework/
├── backend/                 # Backend Application
│   ├── app.py              # Python Flask Server Entry
│   ├── server.js           # Node.js Express Server Entry
│   ├── data/               # JSON Storage (Solutions, Scores, Criteria)
│   ├── utils/              # Calculation Logic (JS & Python)
│   └── package.json        # Node.js dependencies
├── frontend/               # React Application
│   ├── src/
│   │   ├── components/     # UI Components (Cards, Charts, Layouts)
│   │   ├── context/        # State Management (Theme, Data)
│   │   ├── pages/          # Application Routes (Dashboard, Report, etc.)
│   │   └── lib/            # Utility functions (cn, formatters)
│   └── vite.config.js      # Vite Configuration
└── docker-compose.yml      # Container Orchestration
```

## 🧪 Validation

To verify the logic without the frontend, you can run the backend validation script (Python):

```bash
cd backend
python validate.py
```
This script initializes demo data, runs the scoring algorithm, and prints the ranked results to the console.
