# Architecture Overview

## 1. Overview

The Roulette Simulator is a web-based application that simulates a simplified roulette game with customizable parameters. The application allows users to configure game settings, run simulations, and analyze results. Key features include:

- Configurable game parameters (slots, costs, prizes)
- User authentication and saved configurations
- Simulation history and statistics
- Theme customization (light/dark mode)

The application is built using modern web technologies with a focus on performance, maintainability, and user experience.

## 2. System Architecture

The Roulette Simulator follows a client-server architecture using Next.js, which provides both frontend and backend capabilities in a single framework:

- **Frontend**: React-based UI with client-side interactivity
- **Backend**: Next.js API routes for server-side logic
- **Database**: PostgreSQL via Neon Serverless (indicated by @neondatabase/serverless package)
- **Authentication**: NextAuth.js with credentials provider
- **ORM**: Drizzle ORM for database interactions

The application uses a combination of server-side rendering (SSR) and client-side rendering as appropriate for different parts of the application.

```
┌─────────────────┐     ┌───────────────┐     ┌─────────────────┐
│                 │     │               │     │                 │
│   Next.js UI    │────▶│   API Routes  │────▶│   Database      │
│   (React)       │     │   (Next.js)   │     │   (PostgreSQL)  │
│                 │     │               │     │                 │
└─────────────────┘     └───────────────┘     └─────────────────┘
```

## 3. Key Components

### 3.1 Frontend

- **UI Framework**: React with Next.js
- **Styling**: TailwindCSS with custom theme configuration
- **Component Library**: Custom UI components (likely based on shadcn/ui patterns)
- **State Management**: React hooks and context for local and global state
- **Theming**: next-themes for light/dark mode support

The UI is organized into reusable components in the `/components` directory, with specialized subdirectories for authentication and UI components.

### 3.2 Backend

- **API Routes**: Next.js API routes for server-side functionality
- **Authentication**: NextAuth.js for user authentication
- **Database Access**: Drizzle ORM for type-safe database queries
- **Payment Processing**: Stripe integration (based on dependencies)

The backend is structured around API routes in the `/app/api` directory, following Next.js App Router conventions.

### 3.3 Database

The application uses PostgreSQL with the Drizzle ORM for database access. Key database schemas include:

- **Users**: User accounts and profile information
- **Accounts**: OAuth account connections
- **Configurations**: Saved roulette game configurations

The schema is defined in `/lib/db/schema.ts` and database connections are handled by `/lib/db/index.ts`.

### 3.4 Authentication

Authentication is implemented using NextAuth.js with:

- **Credential Provider**: Email/password authentication
- **JWT Strategy**: Token-based sessions
- **Custom Pages**: Custom authentication UI for sign-in, sign-up, etc.
- **Password Hashing**: Bcrypt for secure password storage

The authentication flow is managed by `/app/api/auth/[...nextauth]/route.ts` and abstracted in the frontend via a custom AuthContext.

## 4. Data Flow

The application follows these typical data flows:

### 4.1 Authentication Flow

1. User submits credentials via login/register forms
2. Credentials are sent to NextAuth API routes
3. Server validates credentials against database
4. JWT token is issued and stored in cookies
5. Client uses session data for authenticated requests

### 4.2 Game Simulation Flow

1. User configures game parameters in UI
2. Simulation is triggered client-side
3. Results are calculated and displayed in the UI
4. Users can save configurations to database (if authenticated)

### 4.3 Configuration Management Flow

1. Authenticated users create and save game configurations
2. Configurations are stored in the database
3. Users can browse, edit, and load saved configurations
4. Public configurations can be shared with other users

## 5. External Dependencies

The application relies on several key external dependencies:

### 5.1 Frontend Dependencies

- **React**: UI component library
- **Next.js**: React framework for SSR and API routes
- **TailwindCSS**: Utility-first CSS framework
- **Radix UI**: Primitive UI components (dropdown, switch, etc.)
- **Lucide React**: Icon library
- **React Hook Form**: Form handling
- **React DnD**: Drag and drop functionality

### 5.2 Backend Dependencies

- **NextAuth.js**: Authentication framework
- **Drizzle ORM**: Type-safe database queries
- **Neon Database**: Serverless PostgreSQL client
- **Bcrypt**: Password hashing
- **Stripe**: Payment processing

## 6. Deployment Strategy

The application is configured for deployment on multiple platforms:

### 6.1 Development Environment

- Local development using Next.js dev server on port 5000
- Environment variables configured in `.env.local`
- PostgreSQL database connection via environment variables

### 6.2 Production Deployment

- Configured for deployment on Cloud Run (indicated in `.replit` file)
- Serverless PostgreSQL via Neon Database
- Authentication secrets managed via environment variables

### 6.3 CI/CD

While not explicitly defined in the repository, the structure supports:

- Environment-specific configurations
- Separation of concerns for easy testing
- Database migrations via Drizzle Kit

## 7. Future Considerations

Based on the current architecture, future enhancements could include:

- Implementing more OAuth providers for authentication
- Adding more sophisticated analytics for simulation results
- Enhancing the payment integration for premium features
- Implementing real-time features using WebSockets (WS dependency is present)
- Adding more comprehensive test coverage