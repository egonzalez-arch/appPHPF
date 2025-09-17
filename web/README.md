# PHPF Web Frontend

A modern medical practice frontend built with Next.js, React Query, and TypeScript.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Create .env.local file
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Development

```bash
# Start development server
npm run dev

# Start with Turbopack (faster)
npm run dev:turbo

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard pages with persistent layout
│   ├── login/            # Authentication pages
│   └── layout.tsx        # Root layout with providers
├── components/
│   ├── forms/            # Reusable form components with validation
│   ├── layouts/          # Layout components (DashboardLayout)
│   └── navigation/       # Navigation components (Sidebar, Topbar)
├── context/              # React contexts (AuthContext)
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and helpers
│   ├── api/             # API client and functions
│   └── withAuth.tsx     # HOC for route protection
└── services/             # External service integrations
```

## Features

### Authentication
- JWT-based authentication with refresh tokens
- Role-based access control (admin, doctor, patient)
- Protected routes with middleware
- Optional route protection with `withAuth` HOC

### Layout System
- Persistent dashboard layout with sidebar and topbar
- Responsive design with mobile support
- Dark mode support
- Active route highlighting

### Forms & Validation
- Type-safe forms with React Hook Form + Zod
- Reusable form components
- Consistent validation schemas

### State Management
- React Query for server state
- React Context for global client state
- Automatic error handling and loading states

## Development Guidelines

### Adding New Pages

1. **Dashboard Pages**: Create in `app/dashboard/` - layout is automatically applied
2. **Public Pages**: Create in `app/` root level
3. **Protected Pages**: Use `withAuth` HOC or middleware

Example protected page:
```tsx
import { withAuth } from '@/lib/withAuth';

function AdminPage() {
  return <div>Admin only content</div>;
}

export default withAuth(AdminPage, { requiredRole: 'administrador' });
```

### Creating Forms

Use the Form component with Zod validation:

```tsx
import { Form, FormField, FormInput } from '@/components/forms/Form';
import { loginSchema } from '@/components/forms/schemas/validation.schemas';

function LoginForm() {
  return (
    <Form
      schema={loginSchema}
      onSubmit={(data) => console.log(data)}
    >
      {(form) => (
        <>
          <FormField
            label="Email"
            error={form.formState.errors.email?.message}
            required
          >
            <FormInput
              {...form.register('email')}
              type="email"
              error={!!form.formState.errors.email}
            />
          </FormField>
          
          <button type="submit">Submit</button>
        </>
      )}
    </Form>
  );
}
```

### API Integration

Use the centralized API client:

```tsx
import { useQuery } from '@tanstack/react-query';
import { fetchPatients } from '@/lib/api/api';

function PatientsPage() {
  const { data: patients, isLoading, error } = useQuery({
    queryKey: ['patients'],
    queryFn: fetchPatients,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {patients?.map(patient => (
        <div key={patient.id}>{patient.name}</div>
      ))}
    </div>
  );
}
```

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode  
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Testing Guidelines

- Test components in isolation
- Mock external dependencies (API calls, Next.js router)
- Focus on user interactions and expected behavior
- Use React Testing Library best practices

## Environment Variables

Create `.env.local` for local development:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Optional: Auth0 configuration (if using external auth)
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_ISSUER=your_issuer_url
```

## Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

For deployment platforms like Vercel:
- Ensure environment variables are set
- Build command: `npm run build`
- Start command: `npm start`

## Troubleshooting

### Build Issues
- Clear `.next` cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules package-lock.json && npm install`

### Authentication Issues
- Check API connection and JWT tokens
- Verify middleware.ts configuration
- Ensure cookies are being set correctly

### Development Server Issues
- Try using regular Next.js dev server: `npm run dev`
- Check for TypeScript errors: `npx tsc --noEmit`
