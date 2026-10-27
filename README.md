# Heroes of the Islam (أبطال الإسلام)

A modern, responsive Next.js 15 web application celebrating the noble lives, courage, and legacy of the heroes and great figures of Islam.

## 🚀 Deployment Ready for Vercel & Netlify

This project is pre-configured for seamless, zero-config deployment to both **Vercel** and **Netlify**.

---

### Option A: Deploy to Vercel

Vercel provides native first-party hosting for Next.js 15 with automatic edge caching and serverless functions.

#### Method 1: Git Integration (Recommended)
1. Push this repository to **GitHub**, **GitLab**, or **Bitbucket**.
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New..."** -> **"Project"**.
4. Import your repository.
5. Vercel will auto-detect **Next.js** framework settings from `vercel.json`:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (default)
6. (Optional) Add your environment variables in **Environment Variables**:
   - `GEMINI_API_KEY`: Your Gemini API Key (if using AI features)
   - `APP_URL`: Your Vercel production URL
7. Click **"Deploy"**.

#### Method 2: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

### Option B: Deploy to Netlify

Netlify natively supports Next.js 15 App Router using the OpenNext runtime, pre-configured in `netlify.toml`.

#### Method 1: Git Integration (Recommended)
1. Push this repository to **GitHub**, **GitLab**, or **Bitbucket**.
2. Go to [netlify.com](https://netlify.com) and log in.
3. Click **"Add new site"** -> **"Import an existing project"**.
4. Select your Git provider and pick your repository.
5. Netlify will automatically detect configuration from `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
6. (Optional) In **Environment variables**, add:
   - `GEMINI_API_KEY`: Your Gemini API Key
   - `APP_URL`: Your Netlify production URL
7. Click **"Deploy site"**.

#### Method 2: Netlify CLI
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Link and deploy to preview
ntl init
ntl deploy --build

# Deploy to production
ntl deploy --prod --build
```

---

## 🛠️ Configuration Files Included

- **`vercel.json`**: Explicitly configures Next.js framework preset, build commands, and HTTP security/caching headers.
- **`netlify.toml`**: Configures build command, `.next` output, Node 20 environment, and security/caching headers for Netlify's Next.js OpenNext runtime.
- **`next.config.ts`**: Configured with responsive image domains (`picsum.photos`), motion transpilation, and conditional standalone output so serverless deployments on Vercel and Netlify work without friction.
- **`.env.example`**: Clean template for local, Vercel, and Netlify environment variables.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Open http://localhost:3000 in your browser
```

## 📦 Building Locally

```bash
# Build the production application
npm run build

# Start the production server
npm run start
```
