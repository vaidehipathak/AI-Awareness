# Awareness Platform

## Overview

This is a full-stack web application built as an awareness and education platform. The system provides educational resources, interactive quizzes, blog content, and reporting capabilities to help users learn about important topics and track their engagement. The platform features a modern React frontend with a Node.js/Express backend, using PostgreSQL for data persistence through Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side navigation with page-based routing (Home, Awareness Hub, Quiz, Blog, Report)
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query for server state management and data fetching
- **Styling**: Tailwind CSS with custom CSS variables for theming, supporting light/dark modes

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **API Structure**: RESTful API with `/api` prefix for all routes
- **Request Handling**: Express middleware for JSON parsing, URL encoding, and request logging
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes

### Data Storage
- **Database**: PostgreSQL configured through environment variables
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Schema**: User management system with username/password authentication
- **Migrations**: Automated database migrations with Drizzle Kit
- **Connection**: Neon Database serverless driver for PostgreSQL connectivity

### Development Environment
- **Build System**: Vite for frontend bundling with HMR support
- **Development Server**: Express server with Vite middleware integration in development
- **File Structure**: Monorepo structure with shared types between client and server
- **Path Aliases**: TypeScript path mapping for clean imports (@/, @shared/, @assets/)

### Authentication & Session Management
- **Session Storage**: PostgreSQL-based session storage using connect-pg-simple
- **User Model**: Basic user entity with ID, username, and password fields
- **Storage Interface**: Abstracted storage layer with both memory and database implementations

### UI Component System
- **Design System**: shadcn/ui with consistent theming and component variants
- **Accessibility**: ARIA-compliant components with keyboard navigation support
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Component Library**: Comprehensive set of reusable components (buttons, cards, forms, navigation, etc.)

## External Dependencies

### Database & ORM
- **@neondatabase/serverless**: Serverless PostgreSQL driver for cloud database connectivity
- **drizzle-orm**: Type-safe ORM for database operations and query building
- **drizzle-zod**: Schema validation integration between Drizzle and Zod

### Frontend Libraries
- **@tanstack/react-query**: Server state management and data fetching with caching
- **wouter**: Lightweight client-side routing library
- **@radix-ui/***: Accessible component primitives for UI building blocks
- **tailwindcss**: Utility-first CSS framework for styling
- **class-variance-authority**: Utility for creating variant-based component APIs

### Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking and enhanced developer experience
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay integration
- **@replit/vite-plugin-cartographer**: Replit-specific development enhancements

### Form & Validation
- **react-hook-form**: Form state management and validation
- **@hookform/resolvers**: Validation resolvers for react-hook-form
- **zod**: TypeScript-first schema validation

### Session & Storage
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **express-session**: Session middleware for user authentication state