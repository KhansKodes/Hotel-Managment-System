# Hotel Management System (HMS)

A comprehensive hotel management solution built with Next.js, Firebase, and Tailwind CSS.

## Features

### Employee Management
- Add, edit, and delete employees
- Track employee status (active, inactive, on-leave)
- Store contact information, designation, and salary
- Export employee data to CSV

### Purchase Management (Restaurant Inventory)
- Record inventory purchases for restaurant operations
- Categorize purchases (Meat, Vegetables, Dairy, etc.)
- Track supplier information
- Auto-calculate total costs (quantity × unit cost)
- Monthly filtering and CSV export

### Expense Management
- Track operating expenses (Rent, Utilities, Maintenance, etc.)
- Categorize expenses for better reporting
- Record payment methods
- Monthly filtering and CSV export

### Revenue Tracking
- Record income from room bookings, restaurant sales, and services
- Track customer information and room numbers
- Multiple revenue categories
- Monthly filtering and CSV export

### Dashboard & Reports
- Monthly KPI overview (Revenue, Expenses, Purchases, Salaries)
- Net Profit/Loss calculation
- Category-wise breakdown of income and expenses
- Visual progress indicators
- Export summary and detailed reports to CSV

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **Database**: Firebase Realtime Database
- **Authentication**: Firebase Auth
- **Styling**: Tailwind CSS, shadcn/ui components
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Dates**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd HMS
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with your Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:9002](http://localhost:9002) in your browser.

## How Reports Are Calculated

### Net Profit/Loss Formula
```
Net Profit = Total Revenue - (Total Expenses + Total Purchases + Total Salaries)
```

### Components:
- **Total Revenue**: Sum of all revenue entries for the month
- **Total Expenses**: Sum of all expense entries for the month
- **Total Purchases**: Sum of all purchase costs for the month
- **Total Salaries**: Sum of monthly salaries for all active employees

### Profit Margin
```
Profit Margin (%) = (Net Profit / Total Revenue) × 100
```

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── page.tsx          # Dashboard
│   │   ├── employees/        # Employee management
│   │   ├── purchases/        # Purchase management
│   │   ├── expenses/         # Expense management
│   │   ├── revenue/          # Revenue management
│   │   └── reports/          # Monthly reports
│   ├── login/                # Login page
│   └── register/             # Registration page
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── layout/               # Layout components
│   ├── employees/            # Employee components
│   ├── purchases/            # Purchase components
│   ├── expenses/             # Expense components
│   ├── revenue/              # Revenue components
│   └── shared/               # Shared components
├── context/
│   ├── auth-context.tsx      # Authentication context
│   └── hms-context.tsx       # HMS data context
├── hooks/                    # Custom hooks
└── lib/
    ├── firebase.ts           # Firebase configuration
    ├── types.ts              # TypeScript types
    └── utils.ts              # Utility functions
```

## Data Security

- All data is user-specific (multi-tenant)
- Firebase Authentication for secure access
- Email verification required before login
- Protected routes redirect unauthenticated users

## License

MIT
