# Artisan Alley - Artist-Centric E-Commerce Platform

A full-stack e-commerce platform specifically designed for artists to sell authentic handcrafted artwork with AI-powered storytelling and authenticity verification.

## Features

### 🎨 For Artists
- **Verified Artist Profiles**: Complete verification process with portfolio management
- **Product Management**: Easy-to-use dashboard for adding and managing artwork
- **AI-Powered Stories**: Generate compelling narratives about your artwork using GPT-5
- **Authenticity Verification**: AI-powered verification to prove handcrafted authenticity
- **Sales Analytics**: Track performance and visitor insights
- **Commission Structure**: Transparent fee structure for artists

### 🛍️ For Customers
- **Curated Marketplace**: Browse authentic handcrafted artwork from verified artists
- **Smart Search**: Advanced filtering by category, price, location, and authenticity
- **Story Discovery**: Learn the inspiration and creation process behind each piece
- **Secure Shopping**: Complete cart and checkout experience with multiple payment options
- **Order Tracking**: Full order management and tracking
- **Wishlist & Reviews**: Save favorites and share experiences

### 🔧 For Administrators
- **User Management**: Approve and manage artist verifications
- **Product Verification**: Review and verify product authenticity
- **Platform Analytics**: Comprehensive insights into platform performance
- **Security Monitoring**: Fraud detection and platform security

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling with custom artist-centric design
- **Wouter** for client-side routing
- **TanStack Query** for server state management
- **Shadcn UI** for consistent component library
- **React Hook Form** with Zod validation

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM (in-memory storage for development)
- **JWT** authentication with role-based access control
- **bcrypt** for secure password hashing
- **OpenAI GPT-5** integration for AI storytelling
- **CORS** enabled for frontend-backend communication

### AI Integration
- **OpenAI GPT-5** for product story generation
- **Mock authenticity verification** (production would use computer vision)
- **Advanced prompt engineering** for authentic art narratives

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- OpenAI API key (optional - fallback stories provided)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd artisan-alley
   ```

2. **Install dependencies**
   ```bash
   npm install
   