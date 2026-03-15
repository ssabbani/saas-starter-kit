# Frontend Architecture

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts (dynamically imported)
- **State**: React Context (AuthContext, ToastContext)

## Folder Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Auth pages (login, signup, etc.)
│   │   └── layout.tsx      # Centered card layout
│   ├── dashboard/          # Authenticated pages
│   │   ├── layout.tsx      # Sidebar + topbar wrapper
│   │   ├── page.tsx        # Main dashboard
│   │   ├── admin/          # Admin panel (role-gated)
│   │   └── settings/       # User settings
│   ├── pricing/            # Public pricing page
│   ├── terms/              # Terms of service
│   ├── privacy/            # Privacy policy
│   ├── page.tsx            # Landing page
│   ├── not-found.tsx       # Custom 404
│   ├── error.tsx           # Error boundary page
│   ├── layout.tsx          # Root layout (providers)
│   └── globals.css         # Global styles + animations
├── components/
│   ├── layout/             # Structural components
│   │   ├── sidebar.tsx     # Dashboard sidebar nav
│   │   ├── topbar.tsx      # Mobile top bar
│   │   └── navbar.tsx      # Landing page nav
│   └── ui/                 # Reusable UI primitives
│       ├── stat-card.tsx
│       ├── plan-badge.tsx
│       ├── activity-item.tsx
│       ├── data-table.tsx  # Generic sortable/paginated table
│       ├── loading-skeleton.tsx
│       ├── toast.tsx       # Toast notification system
│       └── error-boundary.tsx
└── lib/                    # Utilities and shared logic
    ├── api.ts              # HTTP client with auth & refresh
    ├── auth-context.tsx    # Auth state + login/signup/logout
    ├── types.ts            # TypeScript interfaces
    ├── pricing.ts          # Plan definitions
    └── use-debounce.ts     # Debounce hook
```

## Adding a New Page

1. Create a file in `src/app/your-route/page.tsx`
2. For authenticated pages, place under `src/app/dashboard/`
3. The dashboard layout auto-wraps with sidebar + auth guard
4. Add the route to `pageTitles` in `src/app/dashboard/layout.tsx`
5. Add sidebar link in `src/components/layout/sidebar.tsx` if needed

## Adding a New API Endpoint

1. Add the TypeScript interface to `src/lib/types.ts`
2. Call `api.get<YourType>("/api/your-endpoint")` from your page
3. Handle loading, error, and empty states
4. The API client auto-handles auth tokens + 401 refresh

## Styling Conventions

- **Border radius**: `rounded-xl` (cards), `rounded-lg` (inputs/buttons)
- **Shadows**: `shadow-sm` (default), `shadow-md` (hover)
- **Colors**: Indigo-600 primary, Slate palette for text/borders
- **Spacing**: `space-y-8` between sections, `gap-6` in grids
- **Typography**: DM Sans font, `font-semibold` headings
- **Animations**: `animate-fade-in`, `animate-slide-up` on page load

### Color Tokens (brand palette)
```
brand-50:  #eef2ff    brand-500: #6366f1
brand-100: #e0e7ff    brand-600: #4f46e5
brand-200: #c7d2fe    brand-700: #4338ca
brand-300: #a5b4fc    brand-800: #3730a3
brand-400: #818cf8    brand-900: #312e81
```

## Modifying Pricing Plans

Edit `src/lib/pricing.ts`:
- Update plan names, prices, features
- Replace placeholder `price_id` values with real Stripe price IDs
- The pricing page and landing page both reference this config
