# TransitOps Backend Platform

## 🚀 Project Overview & Team

TransitOps is a centralized, role-based transport operations platform designed to digitize vehicle, driver, dispatch, maintenance, and expense lifecycle management while enforcing strict operational constraints and providing data-driven fleet analytics. The architecture ensures absolute abstraction between business workflows and raw database queries via a strictly decoupled repository pattern.

### 👥 The Team

* **Gaurav** — Backend Engineering & Data Infrastructure Architecture
* **Ashmeet** — Third-Party Integrations & Endpoint Connections
* **Agrim** — Frontend User Interfaces & Client State Management

---

## ✨ Features Checklist

* **Authentication & Role-Based Access Control (RBAC):** Token-based authentication using native `bcrypt` cryptography with built-in overrides for immediate system-wide testing via an `Admin` bypass guard.
* **Master Destination Catalog:** Structural registration nodes mapping available hubs, fulfillment regions, and route checkpoints.
* **Asset Management (Fleet & Crews):** Comprehensive inventory CRUD actions verifying unique parameters (Vehicle Registration Number and Driver License Number).
* **State-Machine Dispatch System:** Intelligently checks vehicle weight thresholds ($CargoWeight \le VehicleCapacity$) and locks active drivers or vehicles out of competing delivery slots.
* **Maintenance Operations Engine:** Creates vehicle work orders that automatically pull down operational status variables into an unselectable `In Shop` phase.
* **Granular Financial Pipeline:** Explicit line-item expenses (tolls, fuel usage, sudden fixes) tracked directly against independent trip instances.
* **Analytics Dashboard Engine:** Compiles continuous operational metrics including Fleet Utilization, Fuel Efficiency ($Distance/Fuel$), and Vehicle ROI ($\frac{Revenue - Expenses}{Acquisition Cost}$).
* **Responsive Client Interface:** Modern dashboard view states tailored dynamically for Fleet Managers, Drivers, Safety Officers, and Financial Analysts.

---

## 🛠️ Tech Stack & Local Setup


* **Core Engine:** FastAPI (Python 3.11+)
* **Database Engine:** SQLite (Interchangeable via interfaces)
* **Package Management:** `uv` (Fast Python packaging utility)
* **Authentication:** Native `bcrypt` & PyJWT
* **Framework Library:** React (Vite-powered production workspace environment)
* **Style Framework:** Tailwind CSS
* **Visualization:** Recharts / Chart.js for financial analytics maps

---

### Quick Start Setup Instructions

#### 1. Environment Configurations

Clone the codebase workspace and create a standard `.env` configuration template inside the root `backend/` path folder:

```env
DB_PATH=/absolute/path/to/TransitOps_Odoo2026/backend/database/transitops.db
JSON_PATH=/absolute/path/to/TransitOps_Odoo2026/backend/app/db/init/dummy_data.json

```

#### 2. Provision Storage Relational Schemes

Use your module package flag hooks to create tables and execute initial seed sequences safely:

```bash
# Initialize SQLite relational database tables
python -m app.db.init.init_db

# Populate data arrays directly from standard JSON templates
python -m app.db.init.seed_db

```

#### 3. Run the Applications

**For Backend:**

```bash
cd backend
uv run uvicorn app.main:app --reload

```

Navigate to **`[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)`** to authenticate using the pre-seeded `admin@transitops.com` user profile (Password: `admin123`).

**For Frontend:**

```bash
cd frontend
npm install
npm run dev

```

---

## 🏗️ Architecture Blueprint

The platform strictly decouples structural queries from route layers using an **Abstract Repository Pattern**, allowing developers to swap out storage engines (e.g., switching to PostgreSQL or MongoDB) instantly by changing a single session constructor.

```text
transitops-platform/
├── backend/
│   ├── app/
│   │   ├── config.py         # Dynamic absolute path environments manager
│   │   ├── main.py           # FastAPI Application factory and routing setup
│   │   │
│   │   ├── core/             # Cross-cutting security infrastructure
│   │   │   ├── security.py   # Native bcrypt hashing & stateless JWT providers
│   │   │   └── dependencies.py # Gatekeeper RBAC middleware with Admin bypass
│   │   │
│   │   ├── db/               # Decoupled Plug-and-Play Database Storage
│   │   │   ├── base.py       # Strict interface defining required operations
│   │   │   ├── sqlite_repo.py # Core SQLite query implementations
│   │   │   ├── session.py    # Decoupled single source of truth for database context
│   │   │   └── init/         # Standalone setup infrastructure
│   │   │       ├── dummy_data.json       # Complete boilerplate operational seed records
│   │   │       ├── init_db.py            # Dynamic multi-table schema build pipeline
│   │   │       └── seed_db.py            # High-velocity JSON context loader
│   │   │
│   │   └── modules/          # Core Business Routines & Schemas
│   │       ├── auth.py       # OAuth2 compliance forms & token generator
│   │       ├── fleet.py      # Fleet registries (Vehicles & Drivers)
│   │       ├── destinations.py # Master Distribution Hub tracking index
│   │       ├── trips.py      # Trip lifecycle state engine logic
│   │       ├── finance.py    # Expense trackers and ROI calculations
│   │       └── schemas.py    # Strict Pydantic parsing rules and field checks
│   │
│   ├── database/transitops.db # Active engine database file
│   └── .env                  # Dynamic environment configurations file
│
└── frontend/                 # React UI Application Client
    ├── src/
    │   ├── components/       # Shared UI components (Modals, Tables, Forms)
    │   ├── context/          # Global state (AuthContext, ThemeContext for Dark Mode)
    │   ├── services/         # API abstraction layer using Axios client
    │   └── views/            # Dashboard, Fleet, Dispatch, & Finance panels

```

---

## 💾 Done Till Now

### 1. Unified Relational Schema & Plug-and-Play Layer

* **Database Initializer:** Deployed 7 core transactional tables mapping users, destinations, vehicles, drivers, trips, maintenance logs, and line-item expenses.
* **Repository Design:** `base.py` enforces standard data interface contracts. `sqlite_repo.py` completely encapsulates all SQL conversions away from application controllers.

### 2. Identity Assurance & Secure RBAC Gateways

* Replaced vulnerable abstractions with raw, high-velocity native `bcrypt` cryptographic wrappers.
* Implemented `OAuth2PasswordBearer` validation matching FastAPI Swagger UI's internal requirements.
* **Admin Power Bypass:** Injected a global authorization master condition within `RoleChecker`. The `Admin` scope automatically bypasses standard route constraints to dramatically accelerate testing cycles.

### 3. Fully Operational State-Machine & Validation Engine
* `POST /api/trips` executes strict business rules: blocks overlapping transits, flags expired driver licenses, and enforces capacity safety ($CargoWeight \le Capacity$).
* Automated state cascades pivot vehicle/driver nodes to `On Trip` on dispatch, and releases them back to `Available` dynamically upon completion.

* `POST /api/maintenance` forcefully isolates vehicles under repair into the `In Shop` status block.

### 4. Analytics & Financial Compiler

* **Expense Linking:** Deployed transactional routes allowing financial analysts to log expenses (fuel, tolls, maintenance overhead) mapping explicitly back to individual trip identifiers.
* **KPI Synthesis:** Implemented background compute routes evaluating real-time fleet metrics, distance-to-fuel ratios, and true vehicle ROI percentages.
---

## 🔮 Future Roadmap

* **(Automated Actions & Reminders):** Implement automated background workers to fire out email alerts for driver license expirations or critical maintenance check schedules.
* **(Document Management Locker):** Add multi-part cloud storage hooks to allow managers to upload physical insurance copies, registration documents, and commercial driver files directly to fleet logs.
