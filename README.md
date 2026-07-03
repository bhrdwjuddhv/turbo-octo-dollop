# ⚡ HACKMATCH

<p align="center">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</p>

---

## 🎯 Project Motive
Hackathons are fast-paced, high-stakes events where the right team dynamic can make or break a project. However, finding compatible teammates with complementary skills, timezones, and matching hackathon ambitions (e.g., winning vs. learning) is often chaotic and disorganized.

**HackMatch** is built to solve this problem. It acts as an interactive, Tinder-style squad discovery platform for hackers. By creating a brutalist, futuristic space where developers can swipe, match, and establish direct "neural links" (social contacts), HackMatch transforms how teams are built and synchronized.

---

## 🚀 Key Features

* **⚡ Swipe Matching Dashboard**: A card-based discovery environment where you can review potential teammates' roles, coordinates, and skills, swiping to "Connect" or "Skip".
* **💀 Brutalist Onboarding**: A premium multi-step onboarding system requiring credentials, verified social hooks (GitHub & LinkedIn), tech stack inventory, and past projects.
* **🛡️ Secure Authentication**: JWT session-handling through HTTP-only cookies, keeping your hacker credentials and session synchronized.
* **💾 Verified Developer Profiles**: A dedicated dashboard displaying your active coordinates, verified platforms, tech stack icons, and connected project repositories.
* **☁️ Cloudinary Storage integration**: Smooth file handling for custom profile avatars and cover banners.

---

## 🛠️ System Architecture

* **Frontend**: React (built on Vite), styled with Tailwind CSS, using Framer Motion and Anime.js for fluid micro-animations.
* **Backend**: Express server running Node.js, managing database schemas with Mongoose (MongoDB).
* **Storage & Auth**: Multer/Cloudinary media pipeline and bcrypt-secured logins.

---

## 🏁 Quick Setup

### 1. Clone & Install
```bash
git clone https://github.com/sushmita-rgb/turbo-octo-dollop.git
cd turbo-octo-dollop
```

### 2. Configure Environment Variables
Create a `.env` file inside the `backend` folder:
```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 3. Launch Development Environment
**Run Backend:**
```bash
cd backend
npm install
npm run dev
```

**Run Frontend:**
```bash
cd frontend
npm install
npm run dev
```