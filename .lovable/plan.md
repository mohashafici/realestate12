## Real Estate Management System — MVP Plan

A modern, responsive frontend-only MVP using React + TypeScript + Tailwind + TanStack Router, with mock data in a Zustand store (persisted to localStorage) so it's ready for a real backend later. No Lovable Cloud yet — per your spec ("Mock data initially, Ready for future backend integration").

### Design direction
- **Aesthetic:** modern editorial real-estate feel — warm off-white background, deep ink-navy primary, muted terracotta accent, generous whitespace, large property imagery, soft shadows, rounded-2xl cards.
- **Typography:** "Fraunces" (display, serif) for headings + "Inter" for UI/body.
- **Charts:** Recharts (pie + bar).
- **Icons:** lucide-react.

### Tech
- TanStack Start (already scaffolded), file-based routes under `src/routes/`.
- Zustand + `persist` middleware for auth, properties, favorites, inquiries.
- Mock seed data: ~8 properties with Unsplash imagery, a demo agent, a demo buyer, sample inquiries.
- shadcn components: button, card, input, table, dialog, dropdown-menu, sidebar, select, badge, sonner toasts.
- PDF export via `jspdf` + `jspdf-autotable`; Excel via `xlsx`.

### Route map
```
/                              landing → redirects based on auth/role
/auth/login
/auth/register
/agent                         layout (sidebar)
  /agent/                      dashboard
  /agent/properties            table + add/edit
  /agent/properties/new
  /agent/properties/$id/edit
  /agent/properties/available
  /agent/properties/featured
  /agent/inquiries
  /agent/reports
  /agent/profile
/buyer                         layout (top navbar)
  /buyer/                      home (hero + featured + latest)
  /buyer/properties            available + filters
  /buyer/properties/$id        details
  /buyer/favorites
  /buyer/inquiries
  /buyer/profile
```

### Data model (mock store)
Mirrors the schema you listed: `users`, `properties`, `favorites`, `inquiries`. Image field accepts multiple URLs (gallery on details page); add form supports image URL list (no real upload backend yet).

### Features included
- Register/Login with role selection, role-based redirect, route guards.
- Agent: dashboard cards + recent tables; property CRUD with featured star toggle; available/featured filtered views; inquiry management (search, filter, mark read/responded); reports with pie + monthly bar chart, PDF/Excel export.
- Buyer: hero search, featured carousel, latest grid; available listing with search + type/price/location filters; details gallery; favorites (heart toggle); inquiry form + my inquiries list.
- Toasts, confirm dialogs on delete, empty states, loading skeletons, mobile responsive.

### Out of scope (MVP)
- Real backend, real auth, real image uploads, payments, email notifications. All wired so a backend swap later is straightforward.

Approve and I'll build it.