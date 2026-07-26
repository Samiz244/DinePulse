# DinePulse

DinePulse is a real-time restaurant operations platform that connects managers, kitchen staff, and customers through purpose-built interfaces backed by one shared data layer.

Managers can configure a restaurant and its menu, generate customer-facing QR codes, and manage settings. Customers can browse a mobile-first menu and build an order, while kitchen staff use a dedicated display to track orders from pending through completion.

## Highlights

- Role-based experiences for restaurant managers, kitchen staff, and customers
- Supabase authentication with protected manager routes
- Staff-code verification and guarded kitchen-display sessions
- Menu management with instant availability and pricing updates
- Public restaurant pages with categorized menus and customer carts
- Kitchen display system with real-time order-status progression
- QR-code generation for customer access
- Responsive React interface designed for phones and shared restaurant screens
- Early-access lead capture with duplicate-submission handling

## Technology

- **Frontend:** React 19, TypeScript, Vite, React Router, Tailwind CSS
- **Backend services:** Supabase Auth, PostgreSQL, database functions, and real-time data
- **Supporting tools:** QRCode React, ESLint

## Application structure

```text
src/
├── components/     Reusable menu, cart, QR, and settings interfaces
├── context/        Authentication and cart state
├── guards/         Manager and staff route protection
├── hooks/          Restaurant, menu, and kitchen-display data access
├── pages/          Manager, staff, customer, authentication, and landing pages
└── services/       Supabase client configuration
```

## User flows

### Manager

1. Create an account and sign in.
2. Configure the restaurant profile.
3. Add and update menu items.
4. Generate QR codes and review the public restaurant page.

### Customer

1. Open a restaurant-specific menu.
2. Browse items by category.
3. Add items to a cart and place an order.

### Kitchen staff

1. Enter the restaurant slug and staff code.
2. View incoming orders in the kitchen display.
3. Advance each order through `pending`, `preparing`, `ready`, and `completed` states.

## Local setup

### Prerequisites

- Node.js 20 or newer
- A Supabase project with the required tables, database functions, and row-level security policies

### Install and run

```bash
git clone https://github.com/Samiz244/DinePulse.git
cd DinePulse
npm install
```

Create a `.env.local` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Then start the development server:

```bash
npm run dev
```

Other useful commands:

```bash
npm run build
npm run lint
npm run preview
```

## Security notes

DinePulse keeps environment-specific Supabase configuration outside source control. Authorization should be enforced in Supabase with row-level security and database functions; client-side route guards improve the user experience but are not a substitute for database authorization.

## Status

DinePulse is an actively developed portfolio project. Current work focuses on completing the end-to-end ordering flow, strengthening automated tests, and improving deployment documentation.