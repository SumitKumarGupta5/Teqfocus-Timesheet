# Employee Worklog Tracker – Agent Guide

## ⚡ Quick Start

```bash
npm install              # Install dependencies
npm run dev              # Start dev server → http://localhost:3000
npm run build            # Production build
npm run lint             # Check code quality
npm run start            # Run production build
```

## 📋 Project Overview

**Employee Worklog Tracker** is a full-stack work hours tracking application built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Supabase PostgreSQL** backend.

**Core Features:**
- Work log tracking (5 categories: on_project, shadow, bench, leave, training, other_project_support)
- Analytics dashboard with daily trends and project breakdowns
- Role-based access (employee, manager, admin) via Supabase RLS
- Department and project management
- Automated weekly insights via cron jobs
- User-facing AI insights via OpenRouter API

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Tailwind CSS 4, shadcn/ui |
| **Backend** | Next.js 16.2.6 (App Router), Supabase (PostgreSQL + Auth) |
| **Icons & Charts** | lucide-react, recharts |
| **External APIs** | OpenRouter (AI insights), Supabase Edge Functions (cron) |
| **Code Quality** | ESLint 9, TypeScript strict mode |

---

## 🏗️ Architecture Overview

### 3-Layer Design Pattern
```
Frontend (React Components)
    ↓
Data Layer (lib/queries/*.ts, lib/actions/*.ts)
    ↓
Supabase Backend (PostgreSQL + Auth)
```

### Core Principles
- **Server-first**: Pages are server components by default
- **Use client sparingly**: Only for interactivity (forms, dialogs, filters)
- **Validate everywhere**: Server-side validation is mandatory
- **Cache invalidation**: Always call `revalidatePath()` after mutations
- **Type safety**: Strict TypeScript, no `any` types

---

## 📁 Directory Structure

```
app/                      # Next.js App Router pages
├── (dashboard)/          # Protected routes (require auth)
│   ├── logs/            # Work log tracking
│   ├── analytics/       # Analytics & insights
│   ├── settings/        # User profile & projects
│   └── organisation/    # Admin: departments, users, projects
├── auth/                # Public: login, signup, password reset
└── api/cron/insights/   # Scheduled jobs
components/              # React components
├── ui/                  # shadcn/ui components (generated)
├── logs/                # LogForm, LogCard, LogFilters, etc.
├── analytics/           # Charts and analytics components
├── settings/            # Profile, project manager forms
└── layout/              # Sidebar, Topbar, Navigation
lib/
├── actions/             # Server actions (mutations)
├── queries/             # Server queries (read-only)
├── admin.ts             # Admin-only utilities
├── client.ts            # Browser Supabase client
├── server.ts            # Server Supabase client
├── middleware.ts        # Auth guard for protected routes
└── types.ts             # TypeScript types
supabase/                # Database migrations & schema
```

## 🚀 Development Workflow

### Initial Setup
1. `npm install` – Install all dependencies
2. `.env.local` – Already configured with Supabase credentials
3. Database schema – Run `supabase/migration.sql` if migrations are missing
4. `npm run dev` – Start development server on `http://localhost:3000`

### Key Commands
| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Create optimized production bundle |
| `npm run lint` | Check code quality (ESLint) |
| `npm run start` | Run production build locally |

### Debugging
- **Client errors**: Open DevTools (`F12`) → Console
- **Server errors**: Check terminal during `npm run dev`
- **Server actions**: Use `console.log()` in actions (logs appear in terminal)
- **Component inspection**: Use React DevTools browser extension

### Before Committing
1. Run `npm run lint` – must pass
2. Test locally with `npm run dev`
3. Verify `revalidatePath()` called after mutations
4. Check consistent error handling

---

## 🔐 Component & Data Patterns

### Component Decision Tree
```
Does it fetch data?
├─ YES → Server Component (default)
└─ NO → Does it need interactivity/hooks?
    ├─ YES → Client Component ('use client')
    └─ NO → Server Component
```

### Server Components (Default)
- Pages: `app/(dashboard)/logs/page.tsx`, `analytics/page.tsx`, `settings/page.tsx`
- Non-interactive components: `LogGroup.tsx`, `DailyTrendChart.tsx`, `StatCard.tsx`
- **Pattern**: Fetch data, pass as props to client components

### Client Components ('use client')
- Forms: `LogForm.tsx`, `ProfileForm.tsx`, `ProjectManager.tsx`
- Dialogs & filters: `LogDialog.tsx`, `LogFilters.tsx`
- Navigation: `Sidebar.tsx`, `Topbar.tsx`
- **Pattern**: Use `useTransition()` for server action calls

### Server Actions (Mutations)
**Location**: `lib/actions/*.ts` – All marked with `'use server'`

Pattern:
```typescript
export async function createLog(input: CreateLogInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  
  // Validate, insert, revalidate cache
  const { error } = await supabase.from('work_logs').insert(...)
  if (error) return { error: error.message }
  
  revalidatePath('/logs')
  revalidatePath('/analytics')
  return { success: true }
}
```

### Server Queries (Read-Only)
**Location**: `lib/queries/*.ts` – No `'use server'` directive needed

Pattern:
```typescript
export async function getWorkLogs(filter: LogsFilter = {}): Promise<WorkLog[]> {
  const supabase = await createClient()
  let query = supabase.from('work_logs').select('*')
  
  if (filter.userId) query = query.eq('user_id', filter.userId)
  const { data } = await query
  return data ?? []
}
```

### Authentication & Middleware
- **Session**: Supabase SSR middleware refreshes cookies on every request
- **Protected routes**: `/app/(dashboard)/*` redirects to `/auth/login` if not authenticated
- **Auth flows**: `lib/actions/auth.ts` handles sign in, sign up, sign out

---

## 🚨 Critical Gotchas (Most Common Mistakes)

| ❌ Problem | ✅ Solution | 📍 Lines |
|-----------|-----------|---------|
| **Relative imports** (`../../../lib/utils`) | Use path aliases (`@/lib/utils`) | Any import |
| **Forgot `revalidatePath()`** | Call it after all mutations | End of server action |
| **`useSearchParams()` no Suspense** | Wrap with `<Suspense>` boundary | Client component |
| **Server action without `useTransition()`** | Use `useTransition()` for loading state | Form submission |
| **Global Supabase client** | Create fresh instance per request | `lib/client.ts`, `lib/server.ts` |
| **Browser client in server action** | Use `await createClient()` (server) | Server actions only |
| **Missing `getClaims()` in middleware** | Call it to refresh session cookies | `middleware.ts` |

---

## 🗂️ Common Patterns by Task

| Task | Location | Function | Example |
|------|----------|----------|---------|
| **Create work log** | `lib/actions/logs.ts` | `createLog()` | LogForm.tsx calls via `useTransition()` |
| **Update work log** | `lib/actions/logs.ts` | `updateLog()` | LogForm.tsx edit mode |
| **Delete work log** | `lib/actions/logs.ts` | `deleteLog()` | LogCard.tsx delete button |
| **Fetch user logs** | `lib/queries/logs.ts` | `getWorkLogs()` | `logs/page.tsx` server component |
| **Fetch analytics** | `lib/queries/analytics.ts` | `getDailyTrend()` | `analytics/page.tsx` |
| **Create project** | `lib/actions/projects.ts` | `createProject()` | ProjectManager.tsx |
| **Manage departments** | `lib/actions/organisation.ts` | `createDepartment()` | Organisation admin page |
| **Sign in user** | `lib/actions/auth.ts` | `signIn()` | `auth/login/page.tsx` |
| **Sign up user** | `lib/actions/auth.ts` | `signUp()` | `auth/signup/page.tsx` |

---

## 📊 Database Schema Quick Reference

**Work Log Categories**: `on_project`, `shadow`, `bench`, `leave`, `training`, `other_project_support`

**Key Tables**:
- `profiles` – User data, roles (employee/manager/admin), weekly goals
- `projects` – Company projects with color tags
- `departments` – Team organization
- `work_logs` – Time entries with category and project
- `insights` – Weekly summaries for users

**RLS Policies**:
- Employees: See only their own logs
- Managers: See team logs
- Admins: Full access + manage projects

---

## 🔗 Code Conventions

### Imports
```typescript
// ✅ Always use path aliases
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ❌ Never use relative paths for root-level
import { cn } from "../../../lib/utils"
```

### Styling
```typescript
// Use cn() utility for conditional classes
import { cn } from "@/lib/utils"

<Button className={cn("transition-all", disabled && "opacity-50")} />
```

### Adding shadcn Components
```bash
npx shadcn-ui@latest add [component-name]
```

---

## ✨ Before You Code

1. **Check the Common Patterns table** above – find similar existing code
2. **Decide**: Server component or client component?
3. **Use hooks correctly**: `useTransition()` for server actions, `Suspense` for `useSearchParams()`
4. **Always revalidate** after mutations with `revalidatePath()`
5. **Follow existing patterns** – don't create new approaches

---

## 📚 Quick Links

- **Existing Docs**: Check `CODEBASE_OVERVIEW.md` for detailed architecture
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js 16**: [nextjs.org/docs](https://nextjs.org/docs)
- **shadcn/ui**: [ui.shadcn.com](https://ui.shadcn.com/)
- **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com/)