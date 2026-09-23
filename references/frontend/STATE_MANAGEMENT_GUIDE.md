# Frontend State Management Guide

**Purpose:** Provide unambiguous, production-grade state management selection and implementation patterns across React/Next.js, Vue/Nuxt, and Svelte.

**Applies to:** Medium+ UI projects with stateful interfaces, forms, data tables, or real-time views.

---

## 1. State Category Taxonomy

The most common frontend architectural bug is treating all state identically (e.g. storing fetched API data in global Redux or Zustand). Separate state into 5 distinct categories:

| State Category | Purpose | Tool Recommendation (React/Next.js) | Tool Recommendation (Vue/Nuxt) | Tool Recommendation (Svelte) |
|---|---|---|---|---|
| **Server State (Remote Cache)** | Data originating from database/API; requires caching, deduplication, revalidation, optimistic updates. | **TanStack Query (React Query v5)** or **SWR** | **TanStack Query (Vue)** or **Pinia Colada** | **TanStack Query (Svelte)** or SvelteKit load |
| **URL State (Search / Filter)** | Query params, pagination, active tabs, filters. Must be bookmarkable and shareable. | **`nuqs`** or Next.js `useSearchParams` | **`vue-router` query params** | **SvelteKit `$page.url`** |
| **Global Client State** | Purely client-side UI states (sidebar toggled, active modal, current user preferences, audio player). | **Zustand** (or **Jotai** for atomic state) | **Pinia** | **Svelte 5 Runes (`$state`)** or stores |
| **Form State** | Form values, validation errors, dirty state, submission status. | **React Hook Form + Zod** | **VeeValidate + Zod** | **Superforms + Zod** |
| **Data Grid / Table State** | Column sorting, column visibility, row selection, pagination models. | **TanStack Table v8** | **TanStack Table v8** | **TanStack Table v8** |

---

## 2. Hard Architectural Rules

1. **NEVER copy server state into global client state.**
   - ❌ *Anti-pattern:* Fetching users via API and doing `setUserList(users)` inside a global Zustand store.
   - ✅ *Correct:* Fetch and cache via `useQuery({ queryKey: ['users'], queryFn: fetchUsers })`. TanStack Query handles caching, background refreshes, and garbage collection.
2. **URL is the source of truth for views, filters, and pagination.**
   - If a page reloads and loses the user's active filter or tab, the architecture is flawed. Store it in URL query parameters (`/employees?status=active&page=2`).
3. **Colocate state as close to where it is used as possible.**
   - Do not hoist local modal toggle state into global Zustand when only one component tree uses it. Local `useState` is sufficient.

---

## 3. Implementation Patterns (React / Next.js)

### Pattern A: Server State with TanStack Query v5

```typescript
// hooks/use-employees.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useEmployees(status?: string) {
  return useQuery({
    queryKey: ['employees', { status }],
    queryFn: async () => {
      const res = await fetch(`/api/employees?status=${status ?? 'all'}`);
      if (!res.ok) throw new Error('Failed to fetch employees');
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newEmployee: { name: string; position: string }) => {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee),
      });
      if (!res.ok) throw new Error('Create failed');
      return res.json();
    },
    // Invalidate and refetch queries on success
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}
```

---

### Pattern B: Global Client UI State with Zustand

```typescript
// stores/ui-store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface UIState {
  sidebarOpen: boolean;
  activeTheme: 'light' | 'dark' | 'system';
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: true,
        activeTheme: 'system',
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        setTheme: (theme) => set({ activeTheme: theme }),
      }),
      { name: 'ui-settings' } // persist in localStorage
    )
  )
);
```

---

### Pattern C: Robust Forms with React Hook Form + Zod

```typescript
// components/employee-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const employeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  department: z.enum(['Engineering', 'Marketing', 'Finance']),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

export function EmployeeForm({ onSubmit }: { onSubmit: (data: EmployeeFormData) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      department: 'Engineering',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">Name</label>
        <input id="name" {...register('name')} className="input" />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">Email</label>
        <input id="email" type="email" {...register('email')} className="input" />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary">
        {isSubmitting ? 'Saving...' : 'Submit'}
      </button>
    </form>
  );
}
```

---

## 4. State Management Quality Floor Checklist

Before approving frontend state architecture in PRs:
- [ ] No remote API data is duplicated in Zustand/Redux; remote caching handled by TanStack Query / SWR.
- [ ] Sorting, filtering, and pagination states are reflected in URL query parameters.
- [ ] Form schemas are declared with Zod and shared between client validation and API route validation.
- [ ] Mutation error states and optimistic updates are accounted for with rollback logic.
