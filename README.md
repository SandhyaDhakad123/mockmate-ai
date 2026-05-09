# MockMate AI - Enterprise Edition (v2.0)

MockMate AI is an advanced, enterprise-grade AI interview preparation platform. It utilizes the Gemini 1.5 Pro model to simulate technical, behavioral, and architectural interviews, incorporating real-time facial engagement analysis, algorithmic coding assessment, and actionable career analytics.

## 🚀 Key Enterprise Features

- **Decoupled Architecture**: Controller-Service separation ensuring high maintainability and testability.
- **AI Reliability Layer**: Integrated JSON fallback parsing and response sanitization for uninterrupted operations.
- **Emotion AI & Media Intelligence**: Real-time facial confidence tracking with "Session Health" metrics built into the mock interview UI.
- **Actionable Career Analytics**: Generates personalized AI learning roadmaps and visual role-progression charts based on weak topics.
- **Advanced Code Assessment**: Integrated Monaco editor with test case simulation and multi-language AI benchmarking (Time/Space complexities).
- **Hardened Security**: Protected by `helmet`, `express-rate-limit`, global error handlers, and strict `express-validator` payloads.
- **Responsive "Glassmorphism" UI**: Modern gradient aesthetics fully responsive across desktop, tablet, and mobile breakpoints using Framer Motion and Tailwind.

## ⚙️ Dependencies & Prerequisites

- Node.js (v18+ recommended)
- MongoDB (Atlas or Local)
- Google Gemini API Key

## 🛠️ Production Setup Guide

### 1. Clone & Install
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the `/backend` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_hyper_secure_jwt_secret
GEMINI_API_KEY=your_gemini_api_key

# Set environment to 'production' for optimal performance in live deployments
NODE_ENV=production
```

### 3. Build & Deploy Frontend
The frontend is built with Vite and React.
```bash
cd frontend
npm run build
# The /dist folder can now be hosted statically via Vercel, Netlify, or Nginx.
```

### 4. Start Backend (Production)
```bash
cd backend
npm start
```
*Note: We recommend using PM2 (`pm2 start server.js`) for process management in a production server.*

## 🔒 Security Practices Assessed
- **Rate Limiting**: Configured globally at 100 requests / 15 minutes.
- **XSS & NoSQL Injection Protection**: Validations enforced on every sensitive POST/PATCH body via `express-validator`.
- **Helmet Headers**: Secure HTTP headers block widespread exploitation vectors.

## 📄 License
Enterprise Commercial License.
