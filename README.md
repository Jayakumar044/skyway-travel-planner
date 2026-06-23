# Skyway AI — Premium AI Travel Planner

A professional, production-ready full-stack application that crafts personalized travel experiences using Google Gemini AI. Features a high-class UI/UX, robust security, and smart itinerary management.

## ✨ Premium Features

- **Professional Hero UI**: Stunning slider with AI-generated high-resolution travel photography and smooth Framer Motion animations.
- **AI Smart Planner**: Generates complete day-by-day itineraries, budget breakdowns, and hotel recommendations in seconds.
- **Full Schema Validation**: End-to-end type safety and input validation using Zod and React Hook Form.
- **Security First**: Implementation of Helmet for secure headers and Express Rate Limit to prevent abuse.
- **AI Weather-Aware Packing**: Dynamic packing lists based on destination weather and planned activities.
- **Trip Export & Printing**: Beautifully formatted print styles to export your itinerary as a PDF or physical copy.
- **Responsive & Accessible**: Optimized for all devices with a dark-mode focused, glassmorphic design system.

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript, Framer Motion, Swiper, Sonner, Tailwind CSS |
| **Backend** | Node.js, Express.js, Zod, Helmet, Express Rate Limit |
| **Database** | MongoDB Atlas, Mongoose |
| **Authentication** | JWT, bcryptjs |
| **Generative AI** | Google Gemini 2.0 Flash (via REST API) |

## 🚀 Getting Started

### 1. Clone & Install
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### 2. Environment Variables
**Backend (.env)**
```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:3000
```
**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Run Development
```bash
# Backend
npm run dev

# Frontend
npm run dev
```

## 🔐 Security & Validation

- **Backend**: Every request body, param, and query is validated against Zod schemas before processing.
- **Frontend**: Real-time validation with Zod and React Hook Form provides immediate user feedback.
- **Protection**: Middleware enforced for all user-specific data to ensure strict data isolation.

## 🤖 Creative Feature: Professional Trip Export

We implemented a dedicated **Trip Export & Printing** system. While many apps just show data, Skyway AI allows users to take their plans offline with a professionally designed print layout that converts the interactive dashboard into a clean, travel-ready document.

## 🏗 Architecture Decisions

- **Zod Middlewares**: Centralized validation logic to ensure the backend never processes malformed data.
- **Sonner Notifications**: Replaced custom error states with a global, non-intrusive toast system.
- **Swiper + AI Images**: Used Swiper for the hero section to provide a "magazine-like" feel, using custom prompts to generate high-quality visual assets.

---
*Created with passion for modern travelers.*
