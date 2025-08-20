# Movie Notes Application

## Overview

A movie rating and notes management application built with React and Express. The app allows users to rate movies with two different perspectives (Del and Ettore), store multiple photos per movie, and manage their movie collection with search and filtering capabilities. Features a dark theme with orange/red accent colors optimized for movie browsing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development
- **UI Framework**: Shadcn/ui components built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with custom CSS variables for theming, dark color scheme with orange/red accents
- **State Management**: React useState for local component state, TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Data Storage**: Currently using localStorage for persistence (client-side only)

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Development Setup**: Hot reloading with Vite integration for seamless full-stack development
- **API Structure**: RESTful API design with `/api` prefix routing
- **Build Process**: ESBuild for production bundling with external package handling

### Data Storage Solutions
- **Current**: In-memory storage with localStorage persistence for movie data
- **Database Ready**: Drizzle ORM configured for PostgreSQL with schema definitions and migrations
- **Session Management**: Connect-pg-simple for PostgreSQL session storage (configured but not active)

### Authentication and Authorization
- **Framework**: Basic user schema defined with Drizzle ORM
- **Session Handling**: Express sessions with PostgreSQL store capability
- **Current State**: Authentication infrastructure present but not implemented in UI

### Core Features
- **Movie Management**: Add, edit, delete movies with dual rating system (Del/Ettore scores)
- **Photo Support**: Multiple photo uploads per movie with file handling
- **Search/Filter**: Real-time search functionality across movie titles
- **Data Migration**: Automatic data format migration for backward compatibility
- **Responsive Design**: Mobile-optimized interface with custom breakpoints

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL configured via `@neondatabase/serverless`
- **ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Migrations**: Drizzle Kit for schema management and database migrations

### UI Components
- **Radix UI**: Complete set of accessible UI primitives for complex components
- **Shadcn/ui**: Pre-built component library with consistent design system
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe component variant management

### Development Tools
- **TypeScript**: Full type safety across frontend and backend
- **Vite**: Fast development server with HMR and optimized builds
- **Replit Integration**: Custom plugins for development environment integration
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer

### Form and Data Handling
- **React Hook Form**: Form state management with validation
- **Zod**: Schema validation for type-safe data handling
- **Date-fns**: Date manipulation and formatting utilities
- **TanStack Query**: Server state management with caching and synchronization