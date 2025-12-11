# SnippetShare - Premium Code Snippet Sharing Platform

## Overview

SnippetShare is a sleek, minimalistic code snippet sharing platform with a professional, futuristic design aesthetic. Users can create, share, and manage code snippets with features like syntax highlighting, auto-language detection, and shareable links. The platform uses a monochromatic black/green theme emphasizing speed, usability, and premium design.

**Core Features:**
- Create and share code snippets with syntax highlighting
- Auto-detect programming language from code content
- Generate unique shareable links for each snippet
- Dashboard for managing saved snippets (user-specific, requires login)
- Profile management with account settings
- Project support for multi-file code sharing
- User authentication with snippets tied to user accounts
- Private snippets only visible to owners
- Logged out users redirected from dashboard to home page

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query for server state, React useState for local state
- **Styling**: Tailwind CSS v4 with CSS custom properties for theming
- **UI Components**: Shadcn/ui component library (New York style) with Radix UI primitives
- **Code Highlighting**: prism-react-renderer for syntax highlighting
- **Fonts**: Space Grotesk (headings), JetBrains Mono (code), Inter (body)

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **API Style**: RESTful JSON API under `/api` prefix
- **Development**: Vite dev server with HMR, proxied through Express
- **Production**: Static file serving from built assets

### Data Storage
- **Database**: Turso (libSQL/SQLite-compatible edge database)
- **ORM**: Drizzle ORM with SQLite dialect
- **Schema Location**: `shared/schema.ts` - shared between client and server
- **Environment Variables**: `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` required
- **Validation**: Zod schemas generated from Drizzle schemas via drizzle-zod

### Key Design Patterns
- **Shared Types**: Database schemas and types defined once in `shared/` directory, imported by both client and server
- **API Client**: Centralized API functions in `client/src/lib/api.ts`
- **Component Structure**: Reusable UI primitives in `components/ui/`, feature components in `components/`
- **Path Aliases**: `@/` maps to client/src, `@shared/` maps to shared/

### Build System
- **Client Build**: Vite builds React app to `dist/public`
- **Server Build**: esbuild bundles server code to `dist/index.cjs`
- **Database Migrations**: Drizzle Kit with `db:push` command

## External Dependencies

### Database
- **Turso**: Edge SQLite database (requires `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` environment variables)
- **@libsql/client**: Turso database client
- **Drizzle Kit**: Database migration and schema push tooling

### UI Libraries
- **Radix UI**: Accessible component primitives (dialog, dropdown, tabs, etc.)
- **Lucide React**: Icon library
- **date-fns**: Date formatting utilities
- **class-variance-authority**: Component variant management
- **cmdk**: Command palette component

### Development Tools
- **Vite**: Development server and build tool
- **TypeScript**: Type checking (strict mode enabled)
- **PostCSS/Autoprefixer**: CSS processing

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Error overlay in development
- **@replit/vite-plugin-cartographer**: Development tooling
- **@replit/vite-plugin-dev-banner**: Development environment indicator
