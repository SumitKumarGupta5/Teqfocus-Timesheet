# Employee Worklog Tracker – Agent Guide

## Quick Start

```bash
npm run dev       # Start development server on http://localhost:3000
npm run build     # Production build
npm run lint      # Run ESLint (no auto-fix)
```

## Project Overview

**Employee Worklog Tracker** is a full-stack web application for tracking employee work hours and activities. Built with Next.js 16 (App Router), React 19, TypeScript, and Supabase backend.

## Technology Stack

| Layer | Tech |
|-------|------|
| **Frontend** | React 19.2.4, TypeScript, Tailwind CSS 4 |
| **UI Components** | shadcn/ui (radix-nova style), Radix UI primitives |
| **Backend** | Supabase (PostgreSQL + Auth) |
| **Build** | Next.js 16.2.6 (App Router) |
| **Styling** | Tailwind CSS 4 + CSS Variables |
| **Icons** | lucide-react |
| **Linting** | ESLint 9 (Next.js core web vitals + TypeScript) |

## ⚠️ CRITICAL: Next.js 16 Breaking Changes

**This is NOT the Next.js from your training data.** Next.js 16.2.6 has breaking changes in APIs and conventions. Before writing code:
1. Check `node_modules/next/dist/docs/` for latest guides
2. Review deprecation notices in error messages
3. Verify API compatibility before using examples from older docs

## Code Conventions

### Imports & Path Aliases
```typescript
// ✅ Use path aliases for clean imports
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ❌ Avoid relative paths for root-level imports
import { cn } from "../../../lib/utils"
```

**Configured Aliases:**
- `@/*` → root directory
- `@/components` → `./components`
- `@/components/ui` → `./components/ui`
- `@/lib` → `./lib`
- `@/utils` → `./lib/utils`

### Components

- **UI Components:** shadcn/ui in `components/ui/` (generated with shadcn CLI)
- **Page/Feature Components:** In `app/` or feature directories
- **Styling:** Tailwind CSS classes + `cn()` utility from `lib/utils.ts` for conditional styling

```typescript
// Example: Using shadcn component + cn() utility
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function MyComponent({ disabled }: { disabled?: boolean }) {
  return (
    <Button className={cn("transition-all", disabled && "opacity-50")}>
      Click me
    </Button>
  )
}
```

### Component Patterns

- **Server Components:** Default in App Router. Use for data fetching and server logic
- **Client Components:** Add `"use client"` only when needed (interactivity, hooks, browser APIs)
- **Metadata:** Define in `layout.tsx` and `page.tsx` using `Metadata` type from `next`

### Component Classification

**Server Components** (fetch data, no `'use client'`):
- `app/(dashboard)/logs/page.tsx` – fetches work logs, groups by date
- `app/(dashboard)/analytics/page.tsx` – fetches analytics data
- `app/(dashboard)/settings/page.tsx` – fetches user profile
- `app/(dashboard)/layout.tsx` – fetches user auth state, weekly hours
- `app/auth/login/page.tsx` – checks if already authenticated
- `app/auth/signup/page.tsx` – checks if already authenticated
- `components/logs/LogGroup.tsx` – renders log groups (receives data as props)
- `components/analytics/StatCard.tsx`, `DailyTrendChart.tsx` – render charts

**Client Components** (`'use client'`, interactive features):
- `components/logs/LogForm.tsx` – form submission with `useTransition()`
- `components/logs/LogDialog.tsx` – dialog state management
- `components/logs/LogFilters.tsx` – filter state and interactions
- `components/logs/LogCarousel.tsx` – carousel/swipe interactions
- `components/layout/Sidebar.tsx` – navigation, `usePathname()`, route detection
- `components/layout/Topbar.tsx` – user menu, sign out button
- `components/settings/ProfileForm.tsx` – profile form with `useTransition()`
- `components/settings/ProjectManager.tsx` – project CRUD with `useTransition()`
- `components/settings/WeeklyGoalForm.tsx` – goal form with `useTransition()`

### Supabase Integration

- **Connection:** Use `@supabase/supabase-js` with SSR support from `@supabase/ssr`
- **Authentication:** Supabase handles auth (check environment variables for credentials)
- **Database:** PostgreSQL via Supabase – define schema migrations in migration files

### Adding shadcn Components

```bash
npx shadcn-ui@latest add [component-name]
# Example: npx shadcn-ui@latest add dialog
```

## Directory Structure

```
app/               # App Router pages and layouts
├── layout.tsx     # Root layout with Geist fonts
├── page.tsx       # Home page
└── globals.css    # Global styles (Tailwind directives)
components/        # React components
├── ui/            # shadcn/ui components (generated)
└── ...            # Feature components
lib/
├── utils.ts       # Utility functions (cn() for className merging)
└── ...            # Shared logic
public/            # Static assets (images, SVGs)
```

## TypeScript

- **Strict Mode:** Enabled (`"strict": true` in tsconfig.json)
- **Target:** ES2017 for modern JavaScript support
- **Module Resolution:** `bundler` for Next.js compatibility

## Development Workflow

### Setup
1. Install dependencies: `npm install`
2. Configure `.env.local` with Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_key
   ```
3. Load database schema: Run `migration.sql` in Supabase dashboard or via CLI
4. **Middleware auto-detection**: Next.js automatically loads `middleware.ts` at the root. It runs on all requests and protects dashboard routes via the auth guard.

### Running
- **Development**: `npm run dev` → Opens `http://localhost:3000`
  - Hot Module Reloading (HMR) enabled by default
  - TypeScript errors appear in terminal
- **Production Build**: `npm run build` → Creates `.next/` optimized bundle
- **Production Run**: `npm run start` → Runs production build locally (after `npm run build`)

### Linting & Quality
- **Check Linting**: `npm run lint` (ESLint, no auto-fix)
- **TypeScript Strict Mode**: Enabled globally; errors surface during development
- **Before Committing**: Ensure `npm run lint` passes

### Debugging
- Open DevTools (`F12`) and check Console for client-side errors
- Check terminal during `npm run dev` for server-side errors
- Use `console.log()` in server actions to debug on terminal
- Use React DevTools browser extension for component inspection

## Authentication & Middleware

### Session Management (`middleware.ts`)
The project uses Supabase SSR middleware to:
- Refresh session cookies on every request
- Protect routes by redirecting unauthenticated users to `/auth/login`
- Maintain user claims and session state across requests

**⚠️ CRITICAL Pattern — Must Call `getClaims()`:**
```typescript
// lib/middleware.ts (simplified)
export async function middleware(request: NextRequest) {
  let supabase = createServerClient(...)
  
  // DO NOT remove this line — it refreshes session cookies
  const { data: { user }, error } = await supabase.auth.getClaims()
  
  // Now check routes, refresh cookies, etc.
  // ... route protection logic ...
}
```
**Why?** Without `getClaims()`, users may randomly log out (session expires). This call refreshes the session cookie on every request.

**Other Critical Patterns:**
- Never put Supabase client in global variables (Fluid compute issue)
- Create new client instance per request using `await createClient()` or `await createServerClient(...)`
- In server actions: Always call `supabase.auth.getUser()` to verify identity before mutations

### Auth Flows (`lib/actions/auth.ts`)
- **Sign In**: Form-based email/password authentication with error handling
- **Sign Up**: Account creation with profile auto-creation via database trigger
- **Sign Out**: Session termination and redirect to login
- All auth actions redirect on completion and revalidate layout cache

### Protected Routes
- Dashboard routes (`/app/(dashboard)/*`) require authentication via middleware
- Auth routes (`/auth/*`) are publicly accessible
- Middleware automatically redirects unauthenticated users to login

## Data Patterns

### Server Actions (`lib/actions/`)
All server mutations use `'use server'` directive with standardized patterns:
```typescript
// ✅ Correct pattern with error handling
export async function createLog(input: CreateLogInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }
  
  // Validate on server
  if (!input.hours || input.hours <= 0) return { error: 'Invalid hours' }
  
  const { error } = await supabase.from('work_logs').insert({...})
  
  if (error) return { error: error.message }
  
  // Always revalidate cache after mutations
  revalidatePath('/logs')
  revalidatePath('/analytics')
  return { success: true }
}
```

**Conventions:**
- Each action handles one operation (create, update, delete)
- Always authenticate and validate server-side
- Return typed results: `{ success: boolean } | { error: string }`
- Use `revalidatePath()` on all affected routes after mutations
- Client components handle responses with toast notifications (via sonner)

### Query Functions (`lib/queries/`)
Server-only data fetching with typed results:
```typescript
// ✅ Correct pattern
export async function getWorkLogs(filter: LogsFilter = {}): Promise<WorkLog[]> {
  const supabase = await createClient()
  let query = supabase.from('work_logs').select('*, project(*), profile(*)')
  
  if (filter.userId) query = query.eq('user_id', filter.userId)
  if (filter.startDate) query = query.gte('date', filter.startDate)
  
  const { data } = await query
  return data ?? []
}
```

**Conventions:**
- No `'use server'` directive needed (queries are server-only by default)
- Use filter objects for flexible querying
- Join related tables in select clause
- Always return typed data with fallback (e.g., `data ?? []`)

### Database (`supabase/migration.sql`)
PostgreSQL schema with:
- **profiles**: User data with roles (employee/manager/admin) and weekly goals
- **projects**: Company-wide projects with color tags
- **work_logs**: Time entries with categories (on_project, shadow, bench, leave, training, other_project_support)

RLS (Row Level Security) policies:
- Users can only view/edit their own logs unless manager/admin
- Admins can manage projects and see all logs

## Environment Variables

Ensure `.env.local` is set up with Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

## Common Patterns by Task

| Task | Pattern Location | Key Function | Example Use |
|------|------------------|--------------|-------------|
| **Create work log** | Server Action | `createLog()` in `lib/actions/logs.ts` | LogForm.tsx calls via `useTransition()` |
| **Update work log** | Server Action | `updateLog()` in `lib/actions/logs.ts` | LogForm.tsx with edit mode |
| **Delete work log** | Server Action | `deleteLog()` in `lib/actions/logs.ts` | LogCard.tsx delete button |
| **Fetch user's logs** | Query Function | `getWorkLogs()` in `lib/queries/logs.ts` | `logs/page.tsx` server component |
| **Fetch analytics data** | Query Function | `getDailyTrend()`, `getCategorySplit()` in `lib/queries/analytics.ts` | `analytics/page.tsx` |
| **Create project** | Server Action | `createProject()` in `lib/actions/projects.ts` | ProjectManager.tsx |
| **Update profile** | Server Action | `updateProfile()` in `lib/actions/settings.ts` | ProfileForm.tsx |
| **Sign in user** | Server Action | `signIn()` in `lib/actions/auth.ts` | `auth/login/page.tsx` form |
| **Sign up user** | Server Action | `signUp()` in `lib/actions/auth.ts` | `auth/signup/page.tsx` form |
| **Sign out user** | Client + Browser API | `supabase.auth.signOut()` | Topbar.tsx logout button |
| **Protect a route** | Middleware | Redirect via `middleware.ts` | All `/(dashboard)/*` routes |
| **Show loading state** | Component | `loading.tsx` | `logs/loading.tsx`, `analytics/loading.tsx` |
| **Filter logs by date range** | Query Function | `getWorkLogs(filter)` in `lib/queries/logs.ts` | `logs/page.tsx` with `LogsFilter` |

## Domain-Specific Patterns

### Work Categories & Filtering
Work logs are categorized for analytics and reporting. Categories are defined in `lib/types.ts`:
- **on_project**: Active client/billable work
- **shadow**: Learning/mentoring with senior developers
- **bench**: Idle time between projects
- **leave**: Vacation, sick leave, holidays
- **training**: Professional development, certifications
- **other_project_support**: Internal support tasks

**Pattern:** Use `LogFilters` with `category` field to filter logs. Example:
```typescript
const logs = await getWorkLogs({
  userId: user.id,
  startDate: '2024-01-01',
  category: 'on_project' // Optional filter
})
```

### Date-Based Log Grouping (Dashboard Pattern)
Logs page groups entries by date. Pattern:
1. Fetch logs with `getWorkLogs()` (server component)
2. Group by date in `LogGroup.tsx` (server component receives grouped data)
3. Render daily cards with `DailyLogCard.tsx` (receives single day's logs as props)
4. Dialog/form for editing uses `LogForm.tsx` (client component with `useTransition()`)

### Role-Based Access Control
Roles are: `employee`, `manager`, `admin` (stored in `profiles.role`).
- **Employee**: Can only view/edit their own logs
- **Manager**: Can view team logs and analytics
- **Admin**: Can manage projects, see all logs, override permissions

**Pattern:** Use middleware + query filtering:
```typescript
// In middleware: allow route if user exists (any role)
// In queries: filter by user.id for employees, allow all for managers/admins
export async function getWorkLogs(filter: LogsFilter = {}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // If employee, only their logs; if manager/admin, all logs
  if (userRole === 'employee') {
    query = query.eq('user_id', user.id)
  }
  // ... rest of query
}
```

### Analytics Patterns
Analytics queries in `lib/queries/analytics.ts` return typed summary objects:
```typescript
// Returns: AnalyticsSummary with total_hours, avg_hours_per_day, most_worked_project
export async function getAnalyticsSummary(userId: string): Promise<AnalyticsSummary> {
  // Query + aggregation logic
}

// Returns: Array of daily trend points for charting
export async function getDailyTrend(userId: string, days = 30): Promise<DailyTrend[]> {
  // Query last N days, group by date
}
```

Components consume these: `DailyTrendChart.tsx`, `CategoryDonutChart.tsx`, `ProjectBarChart.tsx` render recharts visualizations.

## Common Gotchas

### 🔴 **Relative Imports for Root-Level Code**
❌ **WRONG:**
```typescript
import { cn } from "../../../lib/utils"
import { Button } from "../../../components/ui/button"
```
✅ **CORRECT:**
```typescript
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
```
**Why?** Next.js 16 uses path aliases. Relative imports for root-level modules will cause build failures.

### 🔴 **Forgetting `revalidatePath()` After Mutations**
❌ **WRONG:**
```typescript
export async function createLog(input: CreateLogInput) {
  const supabase = await createClient()
  await supabase.from('work_logs').insert({...})
  // Forgot to revalidate!
  return { success: true }
}
```
✅ **CORRECT:**
```typescript
export async function createLog(input: CreateLogInput) {
  const supabase = await createClient()
  await supabase.from('work_logs').insert({...})
  revalidatePath('/logs')      // Refresh cache
  revalidatePath('/analytics') // Refresh related routes
  return { success: true }
}
```
**Why?** Next.js caches server component renders. Without revalidation, the UI won't update.

### 🔴 **Using `useSearchParams()` Without Suspense**
❌ **WRONG:**
```typescript
'use client'
import { useSearchParams } from 'next/navigation'

export function FilterComponent() {
  const searchParams = useSearchParams() // ⚠️ Will error
  return <div>{searchParams.get('filter')}</div>
}
```
✅ **CORRECT:**
```typescript
'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function FilterComponentInner() {
  const searchParams = useSearchParams()
  return <div>{searchParams.get('filter')}</div>
}

export function FilterComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FilterComponentInner />
    </Suspense>
  )
}
```
**Why?** `useSearchParams()` requires Suspense boundary in client components (Next.js 16 App Router).

### 🔴 **Calling Server Actions Without `useTransition()`**
❌ **WRONG:**
```typescript
'use client'
import { createLog } from '@/lib/actions/logs'

export function LogForm() {
  async function handleSubmit(formData: FormData) {
    const result = await createLog({...}) // Can't show loading state
  }
  return <form onSubmit={handleSubmit}>...</form>
}
```
✅ **CORRECT:**
```typescript
'use client'
import { createLog } from '@/lib/actions/logs'
import { useTransition } from 'react'

export function LogForm() {
  const [isPending, startTransition] = useTransition()
  
  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createLog({...})
    })
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <button disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
```
**Why?** `useTransition()` provides `isPending` state to disable buttons and show loading UI while the server action runs.

### 🔴 **Putting Supabase Client in Global Variables**
❌ **WRONG:**
```typescript
// lib/client.ts
const supabase = createBrowserClient(...) // Global instance
export { supabase }
```
✅ **CORRECT:**
```typescript
// lib/client.ts
export function createClient() {
  return createBrowserClient(...)
}
```
**Why?** Supabase clients with Fluid Compute may share state across requests. Create fresh instances per use.

### 🔴 **Using Browser Supabase Client in Server Actions**
❌ **WRONG:**
```typescript
'use server'
import { createClient } from '@/lib/client' // Browser client!

export async function createLog(input: CreateLogInput) {
  const supabase = createClient() // ❌ Won't work in server action
  await supabase.from('work_logs').insert({...})
}
```
✅ **CORRECT:**
```typescript
'use server'
import { createClient } from '@/lib/server' // Server client

export async function createLog(input: CreateLogInput) {
  const supabase = await createClient() // ✅ Async server client
  await supabase.from('work_logs').insert({...})
}
```
**Why?** Browser clients use `localStorage` (not available on server). Server actions must use `await createClient()` or `createServerClient()`.

## Quick Reference for Agents

### Before Writing Code
1. Check the **Common Patterns by Task** table above to find the right file/function
2. Review the **Component Classification** to decide: Server Component or Client Component?
3. If using `useSearchParams()`, wrap with Suspense (see Common Gotchas)
4. If calling a server action, use `useTransition()` for loading state
5. After mutations, call `revalidatePath()` for affected routes

### External Resources
1. [shadcn/ui docs](https://ui.shadcn.com/) – for UI component usage
2. [Next.js 16 docs](https://nextjs.org/docs) – for App Router patterns
3. [Supabase docs](https://supabase.com/docs) – for database and auth questions
4. [Tailwind CSS docs](https://tailwindcss.com/) – for styling
5. [Radix UI docs](https://www.radix-ui.com/) – for accessible primitives

### Before Committing
1. Run `npm run lint` and fix any issues
2. Test the feature locally with `npm run dev`
3. Verify `revalidatePath()` is called after mutations
4. Check that error handling is consistent with existing patterns

## AI Behavioral Rules

- Never create duplicate files
- Prefer reusable components
- Keep architecture scalable
- Use TypeScript strictly
- Avoid using `any`
- Prefer Server Components
- Use shadcn/ui consistently
- Keep business logic outside UI
- Follow existing patterns before creating new ones

## File Creation Rules

Before creating files:
1. Check existing structure
2. Reuse components/utilities
3. Avoid overengineering
4. Keep folder hierarchy clean