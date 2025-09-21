# Artisan Alley - Artist-Centric E-Commerce Platform

## Overview

Artisan Alley is a full-stack e-commerce platform specifically designed for artists to sell authentic handcrafted artwork. The platform features AI-powered storytelling, authenticity verification, and a curated marketplace experience similar to major e-commerce platforms but tailored for the art community. The system supports three distinct user roles: customers who browse and purchase art, artists who sell their creations, and administrators who manage platform integrity through user and product verification.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

**Frontend Architecture**
The client-side application is built with React 18 and TypeScript, utilizing a modern component-based architecture. The UI leverages Tailwind CSS for styling with a custom artist-centric design system, complemented by Shadcn UI components for consistency. Client-side routing is handled by Wouter, providing a lightweight alternative to React Router. State management follows a hybrid approach using TanStack Query for server state management and React Hook Form with Zod validation for form handling. The application is structured with clear separation between pages, components, and utilities, with proper TypeScript path aliases for clean imports.

**Backend Architecture**  
The server runs on Node.js with Express.js, implementing a RESTful API design. Authentication is handled through JWT tokens with role-based access control supporting three user types: customers, artists, and administrators. Password security is ensured through bcrypt hashing. The backend follows a modular structure with separated route handlers, storage abstractions, and service layers. Middleware functions handle authentication, authorization, and request logging.

**Database Design**
The application uses PostgreSQL as the production database with Drizzle ORM for type-safe database operations. The schema includes tables for users (with role-based fields), categories, products (with artist and authenticity information), shopping carts, orders, and reviews. For development purposes, an in-memory storage implementation is provided. The database schema supports complex relationships between artists and their products, order management, and review systems.

**AI Integration**
OpenAI GPT-5 is integrated for two primary functions: generating compelling product stories and performing authenticity verification. The AI service is designed with proper error handling and includes advanced prompt engineering for creating authentic art narratives. Mock authenticity verification is implemented for development, with the architecture ready for computer vision integration in production.

**Authentication & Authorization**
The system implements JWT-based authentication with role-based access control. Users can register as customers or artists, with artists requiring additional verification through an admin approval process. Protected routes and API endpoints enforce proper authorization based on user roles. Session management is handled client-side with secure token storage.

**State Management**
Client-side state is managed through multiple approaches: TanStack Query handles all server state with proper caching and synchronization, React Hook Form manages form state with Zod validation schemas, and React Context provides authentication state throughout the application. This hybrid approach optimizes performance while maintaining clean separation of concerns.

## External Dependencies

**Database Services**
- PostgreSQL database with Neon serverless for production deployments
- Drizzle ORM for type-safe database operations and migrations
- Connect-pg-simple for PostgreSQL session storage

**AI & Machine Learning**
- OpenAI GPT-5 API for product story generation and content creation
- Planned integration with computer vision APIs for authenticity verification

**UI & Design System**
- Radix UI primitives for accessible component foundations
- Embla Carousel for product image galleries and content carousels
- Tailwind CSS for utility-first styling approach
- Custom design tokens following artist-centric aesthetic principles

**Development & Build Tools**
- Vite for fast development server and optimized production builds
- TypeScript for type safety across frontend and backend
- ESBuild for server-side bundling and optimization
- Replit-specific plugins for development environment integration

**Utility Libraries**
- Date-fns for date manipulation and formatting
- Clsx and class-variance-authority for conditional styling
- Zod for schema validation and type inference
- Nanoid for secure random ID generation