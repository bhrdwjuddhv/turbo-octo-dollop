// backend/constants/techStack.constants.js
//
// Central pool of skills / roles / interests used across the platform.
// Import TECH_STACK wherever you validate/autocomplete a user's or team's
// skill list so the frontend, backend, and seed data all stay in sync.

export const TECH_STACK = [
    // Frontend
    "javascript", "typescript", "react", "next.js", "vue", "nuxt.js",
    "angular", "svelte", "solid.js", "html", "css", "tailwindcss",
    "sass", "redux", "zustand", "webpack", "vite",

    // Backend
    "node.js", "express.js", "nestjs", "django", "flask", "fastapi",
    "spring boot", "laravel", "ruby on rails", "asp.net core", "go",
    "gin", "rust", "actix", "php", "graphql", "trpc",

    // Mobile
    "flutter", "dart", "react native", "swift", "swiftui", "kotlin",
    "jetpack compose", "objective-c", "xamarin", "ionic",

    // Data / AI / ML
    "python", "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch",
    "keras", "opencv", "nltk", "huggingface transformers", "langchain",
    "r", "julia", "jupyter", "data engineering", "computer vision",
    "natural language processing", "llm fine-tuning", "prompt engineering",

    // Databases
    "mongodb", "postgresql", "mysql", "sqlite", "redis", "firebase",
    "supabase", "dynamodb", "cassandra", "elasticsearch", "prisma",
    "mongoose",

    // DevOps / Cloud
    "docker", "kubernetes", "aws", "azure", "gcp", "terraform",
    "ansible", "ci/cd", "github actions", "jenkins", "nginx",
    "linux", "bash scripting", "vercel", "netlify",

    // Blockchain / Web3
    "solidity", "web3.js", "ethers.js", "hardhat", "smart contracts",
    "rust (solana)", "ethereum", "polygon", "ipfs", "nfts",

    // Game Dev / XR
    "unity", "unreal engine", "c#", "c++", "blender", "webgl",
    "three.js", "ar/vr development",

    // Design / Product
    "figma", "adobe xd", "ui design", "ux research", "product design",
    "sketch", "framer",

    // Other / General CS
    "java", "c", "system design", "data structures & algorithms",
    "microservices", "websockets", "api design", "testing (jest/cypress)",
    "agile/scrum",
];

export const ROLES = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Mobile Developer (Flutter)",
    "Mobile Developer (React Native)",
    "iOS Developer",
    "Android Developer",
    "ML Engineer",
    "Data Scientist",
    "Data Engineer",
    "DevOps Engineer",
    "Cloud Engineer",
    "Blockchain Developer",
    "Game Developer",
    "UI/UX Designer",
    "Product Designer",
    "Product Manager",
    "QA Engineer",
    "Security Engineer",
    "AR/VR Developer",
    "Embedded Systems Engineer",
    "Technical Writer",
];

export const EXPERIENCE_LEVELS = [
    "Beginner",
    "Intermediate",
    "Advanced",
    "Expert",
];

// Freeform "experience" entries (schema stores these as plain strings)
export const EXPERIENCE_SNIPPETS = [
    "1 hackathon participated",
    "2 hackathons participated",
    "3+ hackathons participated",
    "Winner - college-level hackathon",
    "Finalist - national hackathon",
    "1 year of professional experience",
    "2 years of professional experience",
    "3+ years of professional experience",
    "Open source contributor",
    "Freelance developer",
    "Internship at a startup",
    "Led a student developer club",
    "Built and shipped a personal SaaS project",
    "Contributed to a Google Summer of Code project",
];

export const PREFERENCES = [
    "AI/ML",
    "Web3 & Blockchain",
    "Open Source",
    "FinTech",
    "HealthTech",
    "EdTech",
    "Climate Tech",
    "Developer Tools",
    "Social Impact",
    "Gaming",
    "AR/VR",
    "IoT",
    "E-commerce",
    "Productivity Tools",
    "Cybersecurity",
    "Remote-friendly team",
    "Beginner-friendly team",
    "Competitive / prize-focused",
    "Overnight hackathons",
    "Weekend hackathons",
];

export const PROJECT_IDEAS = [
    "AI-powered resume screening assistant",
    "Real-time carbon footprint tracker",
    "Decentralized micro-lending platform",
    "Mental health check-in chatbot",
    "Campus lost-and-found marketplace",
    "Smart irrigation system using IoT sensors",
    "Accessibility-first browser extension for screen readers",
    "Peer-to-peer skill exchange platform",
    "AR navigation app for indoor spaces",
    "Blockchain-based ticketing system to prevent scalping",
    "Voice-controlled recipe assistant",
    "Local business discovery app with social reviews",
    "Automated code review bot for GitHub PRs",
    "Gamified habit tracker with social accountability",
    "Real-time collaborative whiteboard for remote teams",
    "AI-generated study notes from lecture recordings",
    "Disaster relief coordination dashboard",
    "Freelancer invoice & contract management tool",
    "Crowd-sourced accessibility map for wheelchair users",
    "Personal finance tracker with spending insights",
    "NFT-gated community platform",
    "Plant disease detection using computer vision",
    "Sign language to text translator",
    "Smart parking availability finder",
    "Anonymous campus confession & support board",
];

export const HACKATHON_NAMES = [
    "HackMIT 2026",
    "TreeHacks 2026",
    "PennApps XXVI",
    "HackTheNorth 2026",
    "CalHacks 12.0",
    "ETHGlobal Delhi",
    "Smart India Hackathon 2026",
    "Devfolio Winter Hacks",
    "Major League Hacking Open",
    "Google Solution Challenge 2026",
    "Meta University Hackathon",
    "NASA Space Apps Challenge",
    "Global AI Hackathon 2026",
    "Web3 Builders Summit Hack",
    "Local Community HackJam",
];

export const CITIES = [
    "Bengaluru, Karnataka",
    "Mumbai, Maharashtra",
    "Delhi, Delhi",
    "Hyderabad, Telangana",
    "Pune, Maharashtra",
    "Chennai, Tamil Nadu",
    "Kolkata, West Bengal",
    "Ahmedabad, Gujarat",
    "Jaipur, Rajasthan",
    "Chandigarh, Chandigarh",
    "Noida, Uttar Pradesh",
    "Gurugram, Haryana",
    "Kochi, Kerala",
    "Indore, Madhya Pradesh",
    "Nagpur, Maharashtra",
    "Lucknow, Uttar Pradesh",
    "Coimbatore, Tamil Nadu",
    "Bhubaneswar, Odisha",
    "Surat, Gujarat",
    "Visakhapatnam, Andhra Pradesh",
    "Thiruvananthapuram, Kerala",
    "Bhopal, Madhya Pradesh",
    "Vadodara, Gujarat",
    "Mysuru, Karnataka",
    "Nashik, Maharashtra",
];

// NEW - Phase 4 (working hours compatibility signal)
export const WORKING_HOURS_OPTIONS = [
    "Early Bird (6AM - 12PM)",
    "Daytime (12PM - 6PM)",
    "Evening (6PM - 12AM)",
    "Night Owl (12AM - 6AM)",
    "Flexible / Anytime",
];

// NEW - Phase 6 (drives hackathonsWon / hackathonsParticipated on Team)
export const TEAM_RESULTS = [
    "not_specified",
    "participated",
    "finalist",
    "winner",
];