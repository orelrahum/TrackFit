# Technical Stack Documentation

## Core Technologies

### Frontend Framework
- **React 18+ with TypeScript**
- Vite as build tool
- SPA (Single Page Application) architecture

### UI Framework
- **Tailwind CSS**
  - Location: `tailwind.config.ts`
  - Custom configuration
  - JIT (Just-In-Time) compilation

- **Shadcn UI Components**
  - Location: `src/components/ui/`
  - Pre-built accessible components
  - Customizable themes
  - Common components used:
    - Dialog
    - Button
    - Progress
    - Card
    - Form elements

### Backend Services
- **Supabase**
  - Location: `src/lib/supabase.ts`
  - Features used:
    - Authentication
    - PostgreSQL database
    - Real-time subscriptions
    - Row Level Security (RLS)

## Project Configuration

### TypeScript
```typescript
// tsconfig.json
{
  "compilerOptions": {
    // Core settings for React/Vite project
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    
    // Strict type checking
    "strict": true,
    
    // Module resolution
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    
    // Path aliases and types
    "types": ["vite/client"],
  }
}
```

### Build Tool
- **Vite Configuration**
  - Location: `vite.config.ts`
  - Features:
    - Fast HMR (Hot Module Replacement)
    - TypeScript support
    - Environment variables
    - Build optimizations

### Environment Variables
- `.env.example` template
- Required variables:
  ```
  VITE_SUPABASE_URL=
  VITE_SUPABASE_ANON_KEY=
  ```

## Project Structure

### Source Organization
```
src/
├── components/     # React components
├── context/       # React contexts
├── hooks/         # Custom hooks
├── lib/           # Services/utilities
├── pages/         # Route components
└── types/         # TypeScript types
```

### Key Directories
- `public/` - Static assets
- `migrations/` - Database migrations
- `scripts/` - Utility scripts
- `GOV_DB/` - Food database files

## Development Tools

### Package Manager
- npm/bun for dependency management
- Location: `package.json`, `bun.lockb`

### Code Quality
- ESLint for linting
- PostCSS for CSS processing
- TypeScript for type safety

### Testing
- No testing framework currently implemented
- Potential future addition

## External Dependencies

### Core Dependencies
```json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "@supabase/supabase-js": "latest",
  "tailwindcss": "^3.0.0",
  // ... other dependencies
}
```

### Dev Dependencies
```json
{
  "typescript": "^5.0.0",
  "vite": "^4.0.0",
  "@types/react": "^18.0.0",
  // ... other dev dependencies
}
```

## Database Schema

### Key Tables
- users
- meals
- water_intake
- user_targets

### Relationships
- One-to-many between users and meals
- One-to-many between users and water_intake
- One-to-one between users and user_targets

## Security

### Authentication
- Supabase Auth
- Protected routes
- JWT token handling

### Database Security
- Row Level Security (RLS)
- User-specific data access
- Secure API endpoints

## Performance Considerations

### Bundle Size
- Code splitting
- Lazy loading
- Tree shaking

### Data Loading
- Efficient queries
- Pagination where needed
- Optimistic updates

### Caching
- Browser caching
- Runtime caching
- Database query optimization
