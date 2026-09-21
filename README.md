# UniNest 🎓

> **Making Nigerian Students Comfortable**  
> All-in-one student support platform engineered for Nigerian higher education institutions — built with verified campus housing, STS (Save Till Sign-Out) clearance funds, anti-scam escrow marketplace, student gifting, and academic assistance.

---

## 🌟 Key Features

### 1. 💰 STS (Save Till Sign-Out) & Student Gifting
- **Locked Clearance Fund**: Safe savings vehicle dedicated to final-year clearance fees, project defense expenses, and graduation sign-out logistics.
- **70% Threshold Unlock**: Milestone unlocks when target balance reaches 70%, granting access to special bonus tokens.
- **Gifting Account & Peer Transfers**: Instant peer-to-peer student gifting with custom celebration notes and direct bank withdrawals.
- **Admin Verification Portal**: Manual bank transfer verification with printable PDF/WhatsApp audit receipts.

### 2. 🏠 Campus Lodges & Roommate Matching
- **Verified Lodges Directory**: Off-campus and on-campus accommodation listings around Niger Delta University (NDU Amassoma), Federal University Otuoke (FUOTUOKE), Bayelsa State Polytechnic (BYSPOLY), College of Education (COE Sagbama), and Federal University of Health Sciences Otogbolo (FUHSI).
- **Face-Verified Roommate Matching**: Compatibility matching based on faculty, sleep schedules, cleanliness habits, study preferences, and shared budgets.
- **Safety Guidelines & Landlord Direct Chat**: Direct verification badges and safety protocols for off-campus lodging.

### 3. 🛡️ Marketplace & Escrow Protection Vault
- **Anti-Scam Escrow System**: Buyers deposit funds into the verified UniNest Escrow Account. Funds are safely held until the buyer physically inspects and confirms the item or a 3-working-day dispute-free window elapses.
- **WhatsApp Order Confirmations**: Instant pre-formatted WhatsApp escrow orders for sellers and campus scouts.
- **Vendor Portal**: Dedicated dashboard for verified campus vendors to track orders, sales performance, and escrow payouts.

### 4. ⚡ Cheap Student Data Hub
- **Direct SME & Corporate Bundles**: Discounted data top-ups across MTN, Airtel, GLO, and 9mobile with 30-day validity.
- **Instant Delivery**: 24/7 automated queue with transaction history and proof-of-payment receipts.

### 5. 📚 Academic Assist & QA Hub
- **Inter-University Knowledge Base**: Verified students can ask questions, share past exams, download syllabus outlines, and tip peer tutors.
- **Project & Defense Prep**: Connect with departmental mentors and senior scholars.

### 6. ❤️ Student Crowdfunding & Relief
- **Transparent Aid Campaigns**: Exam fee emergencies, health interventions, and tuition support with public progress thermometers and verifiable institutional receipts.

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/) + [Vite 6](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Motion](https://motion.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend & Database**: [Supabase](https://supabase.com/) (Auth, PostgreSQL `profiles` table)
- **Notifications & Email**: EmailJS & native browser notifications
- **Deployment Target**: [Vercel](https://vercel.com/) (Auto-deploy enabled via GitHub)

---

## 🚢 Deploying to Vercel (Auto-Deploy Guide)

This application is fully pre-configured for automated continuous deployment to Vercel:

### 1. Connect GitHub Repository
1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** > **Project**.
3. Import your GitHub repository: `uninest-nigeria` (`https://github.com/Uninest-ui/uninest-nigeria`).

### 2. Configure Build & Output Settings
Vercel automatically detects Vite with the pre-configured parameters:
- **Framework Preset**: `Vite`
- **Root Directory**: `./`
- **Build Command**: `npm run build` (or `vite build`)
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. SPA Routing with `vercel.json`
The project includes `vercel.json` to handle client-side routing fallback without 404 errors on page reload:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 4. Environment Variables
In the Vercel Project Settings under **Environment Variables**, add:
- `VITE_SUPABASE_URL` (Your Supabase project URL)
- `VITE_SUPABASE_ANON_KEY` (Your Supabase anonymous publishable key)
- `GEMINI_API_KEY` (Optional for server-side AI integrations)

### 5. Instant Deployment & Git Auto-Deploy
- Click **Deploy**. Vercel will build and assign your production `.vercel.app` domain.
- Any subsequent commits or pushes to the `main` branch trigger an automatic zero-downtime deployment.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm, yarn, or pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Uninest-ui/uninest-nigeria.git
   cd uninest-nigeria
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env.local` and add your credentials:
   ```bash
   cp .env.example .env.local
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 🔒 Security & Anti-Fraud Architecture

- **Escrow Vault Rules**: Escrow disbursements require explicit dual-confirmation or audited administrative sign-off.
- **Row-Level Security (RLS)**: User balances and profiles are securely protected in Supabase PostgreSQL tables.
- **Client Security**: Private API keys and backend secrets remain isolated in protected environment configurations.

---

## 📄 License

This project is proprietary and maintained by the **UniNest Nigeria** Team. All rights reserved.
