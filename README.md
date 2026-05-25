# ⏱️ Teqfocus Timesheet

<p align="center">
  <img src="https://www.teqfocus.com/wp-content/uploads/2024/06/Teqfocus-Corrected-Logo156x70.png" alt="Teqfocus Logo" width="220" />
</p>

<p align="center">
  A state-of-the-art, secure, and modern employee work hours tracking and analytics application built with <strong>Next.js 16 (App Router)</strong>, <strong>React 19</strong>, <strong>TypeScript</strong>, and a robust <strong>Supabase</strong> PostgreSQL database backend.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/react-19.2-20232a?style=for-the-badge&logo=react&logoColor=61dafb" alt="React 19" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/tailwind_css-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</p>

---

## 🌟 Core Features

- **⏱️ Precise Time Tracking**: Log hours daily across distinct project and support categories.
- **📊 Interactive Analytics Dashboard**: Rich data visualizations showing daily trends and project distributions using **Recharts**.
- **🔒 Secure Password Management**: Sign-in page includes a high-fidelity **Change Password** modal utilizing secure stateless credentials verification and auto-login redirection.
- **🤝 Advanced Project Allocation**: Searchable dialog modals for managers to assign and remove employees from departments they oversee.
- **🛡️ Row Level Security (RLS)**: Fine-grained security policies on PostgreSQL preventing unauthorized access.
- **🤖 AI-Driven Insights**: Automated weekly summaries and productivity reviews powered by **OpenRouter API**.

---

## 👥 Roles & Permissions Matrix

The platform enforces strict role-based access control (RBAC). Here is who can access what:

| Feature / Action | 👑 Admin | 👥 Manager | 👤 Employee |
| :--- | :---: | :---: | :---: |
| **Log Work Hours** | ✅ | ✅ | ✅ |
| **Personal Analytics** | ❌ | ✅ | ✅ |
| **Manage Departments & Colors** | ✅ | ❌ | ❌ |
| **Create Projects** | ✅ | ❌ | ❌ |
| **View Team Directory & Status** | ✅ | ✅ | ❌ |
| **Add/Remove Project Members** | ✅ | ✅ (Own Dept) | ❌ |
| **Receive Weekly AI Insights** | ✅ | ✅ | ✅ |

---

## 📁 Work Log Categories

Employees can log hours under six distinct categories to classify work:

| Category Icon | Category Name | Description |
| :--- | :--- | :--- |
| 💻 | `on_project` | Standard billable hours spent on client projects |
| 👥 | `shadow` | Training or shadow assistance on ongoing client projects |
| 🪑 | `bench` | Unallocated time waiting for project assignments |
| 🏖️ | `leave` | Paid leaves, sick leaves, and official holidays |
| 🎓 | `training` | Internal skill development and certification programs |
| 🛠️ | `other_project_support` | Support contributions to other non-primary project teams |

---

## 🛠️ Technology Stack

| Layer | Technology | Version / Tooling |
| :--- | :--- | :--- |
| **Core Framework** | **Next.js** | `16.2.6` (App Router, Server Actions) |
| **Frontend UI Library** | **React** | `19.2.4` (Concurrent features, Transition API) |
| **Database & Auth** | **Supabase** | PostgreSQL database with Row Level Security (RLS) |
| **Styling Engine** | **Tailwind CSS** | `v4.0` (Native PostCSS tooling) |
| **Component Kit** | **shadcn/ui** | Clean components backed by Radix UI primitives |
| **Data Visualizations** | **Recharts** | Interactive charts and SVG-based graph visualizations |
| **AI Processing** | **OpenRouter** | Integrated LLM calls for weekly user summaries |

---

## 📂 Project Architecture

```
├── app/                       # Next.js App Router pages & layout configurations
│   ├── (dashboard)/           # Authenticated routes & view dashboards
│   │   ├── logs/             # Work log tracking grid
│   │   ├── analytics/        # Daily trends & chart views
│   │   ├── settings/         # Profile setups & preferences
│   │   └── organisation/     # Admin: departments, users, projects
│   ├── auth/                 # Authentication screens (Login, Signup, Reset)
│   └── api/cron/insights/    # Scheduled cron jobs for automated weekly AI reports
├── components/                # Reusable React components
│   ├── ui/                   # Core Radix-based UI components (dialog, button, cards)
│   ├── logs/                 # Time logging form components
│   ├── analytics/            # Recharts implementations
│   └── layout/               # Sidebar and Topbar navigation widgets
├── lib/                       # Business logic & helper configurations
│   ├── actions/              # Server Actions (mutations & authentication)
│   ├── queries/              # Database read functions (read-only)
│   ├── client.ts             # Browser Supabase client
│   └── server.ts             # Server Supabase client
└── supabase/                  # Database migrations, seed scripts, & SQL helpers
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js `18.x` or later
- A Supabase Project (Database schema & Auth setup)

### Setup & Installation

1. **Clone the repository and install dependencies:**
   ```bash
   git clone https://github.com/Teqfocus-Timesheet/employee-worklog-tracker.git
   cd employee-worklog-tracker
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env.local` file in the root directory and add the following:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   TRACKER_OPENROUTER_API_KEY=your_openrouter_api_key
   OPENROUTER_MODEL=openrouter/auto
   CRON_SECRET=your_secured_cron_secret_token
   ```

3. **Database Migration:**
   Apply the migrations located under the `supabase/` folder to your database to set up tables, RLS policies, and triggers.

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) on your browser to view the application.

5. **Linting & Production Builds:**
   ```bash
   npm run lint              # Check code quality & formatting
   npm run build             # Generate optimized production assets
   npm run start             # Run production build locally
   ```

---

## 🔒 Security & Row Level Security (RLS)

All tables in the schema (`profiles`, `work_logs`, `projects`, `departments`) have RLS policies enabled.
- **Employees** can only view and manage their own work logs and profiles.
- **Managers** can view profiles and manage projects of employees under the departments they manage.
- **Admins** have full access to create departments, projects, and manage all users.
- Helper functions like `is_project_member` run securely as `SECURITY DEFINER` functions to prevent infinite RLS recursion policies during project member assignment.

---

<p align="center">
  Teqfocus &copy; 2026. Made for Teqfocus Consulting LLC.
</p>
