# TRUSTIFY

TRUSTIFY is a Web3 crowdfunding app.

**Tech stack**

- Frontend: React + Vite + TypeScript + Tailwind
- Backend: Node.js + Express + MongoDB
- Blockchain: Solidity + Hardhat (Sepolia)

**Roles (must be lowercase)**

- `donor`: explore + donate
- `creator`: create campaigns
- `admin`: approve campaigns

## Quick start (local)

### 1) Start MongoDB

Make sure MongoDB is running on your machine.

### 2) Start the backend

From the project root:

```bash
cd backend
npm install
npm run dev
```

- Backend URL: http://localhost:5000
- All API routes are under `/api/*`
- Env file: [backend/.env](backend/.env)

### 3) Start the frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

- Frontend URL: http://localhost:5173
- Env file: [frontend/.env](frontend/.env)

### 4) Smoke test

1. Open http://localhost:5173
2. Sign up and log in
3. Refresh the page (session should persist via stored JWT + `/api/auth/me`)

## Blockchain (Sepolia)

Contract source: [blockchain/contracts/Trustify.sol](blockchain/contracts/Trustify.sol)

### Compile

```bash
cd blockchain
npm install
npm run compile
```

npx hardhat node
npx hardhat run scripts/deploy.js --network localhost

### Deploy to Sepolia (needed for on-chain Create/Donate)

To deploy, you need:

- A Sepolia RPC URL (Alchemy/Infura/etc.)
- A deployer **private key** with SepoliaETH

Important:

- A wallet address is NOT a private key.
- Private key length must be 32 bytes (64 hex characters).

#### Option A (recommended): use `blockchain/.env`

Create [blockchain/.env](blockchain/.env) and set one of each:

```dotenv
SEPOLIA_RPC_URL=...
# OR
CHAIN_RPC_URL=...

DEPLOYER_PRIVATE_KEY=...
# OR
PRIVATE_KEY=...
```

Then deploy and sync the contract address into the frontend:

```bash
npm run deploy:sepolia:sync
```

This script:

1. Deploys the contract to Sepolia
2. Prints the deployed address
3. Updates [frontend/.env](frontend/.env) with `VITE_CONTRACT_ADDRESS=...`

#### Option B: set env vars in PowerShell

```powershell
$env:CHAIN_RPC_URL = "https://rpc.ankr.com/eth_sepolia"
$env:DEPLOYER_PRIVATE_KEY = "0xyour_private_key"
npm run deploy:sepolia
```

### Keep backend + frontend in sync

After deploying, set the contract address in BOTH places:

- [frontend/.env](frontend/.env): `VITE_CONTRACT_ADDRESS=...`
- [backend/.env](backend/.env): `CHAIN_CONTRACT_ADDRESS=...`

Restart backend + frontend after updating env files.

## Production deployment (make it work on a live site)

To run TRUSTIFY fully on a public URL you must deploy **all 3 parts**:

1. **Smart contract** (Sepolia or Mainnet)
2. **Backend API** (Node/Express)
3. **Frontend** (Vite React)

Recommended hosting (simple + common):

- **Frontend:** Vercel or Netlify
- **Backend:** Render / Railway / Fly.io
- **Database:** MongoDB Atlas

### Deployment order (important)

1. Deploy the **contract** → you get `CONTRACT_ADDRESS`
2. Deploy the **backend** (needs `CHAIN_CONTRACT_ADDRESS`)
3. Deploy the **frontend** (needs `VITE_API_BASE_URL` + `VITE_CONTRACT_ADDRESS`)

---

### 1) Deploy MongoDB (Atlas)

1. Create a free cluster on MongoDB Atlas
2. Create a database user + allow network access (or `0.0.0.0/0` for quick testing)
3. Copy your connection string and set it as:

```dotenv
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
```

---

### 2) Deploy the smart contract (Sepolia)

You already have scripts in the `blockchain` folder.

1. Add `blockchain/.env`:

```dotenv
SEPOLIA_RPC_URL=https://...  # Alchemy/Infura/Ankr/etc.
DEPLOYER_PRIVATE_KEY=0x...   # MUST have SepoliaETH
```

2. Deploy:

```bash
cd blockchain
npm install
npm run deploy:sepolia
```

Save the deployed address (example):

```text
0xYourDeployedContractAddress
```

---

### 3) Deploy the backend (API)

Deploy the `backend` folder to Render/Railway/Fly. Set the **start command** to:

```bash
npm start
```

Set these environment variables on the hosting dashboard:

```dotenv
NODE_ENV=production
PORT=5000

MONGODB_URI=...           # from Atlas
JWT_SECRET=...            # long random string

CORS_ORIGIN=https://your-frontend-domain.com

CHAIN_ID=11155111
CHAIN_RPC_URL=https://...  # Sepolia RPC
CHAIN_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

After deploy, your backend should be reachable like:

```text
https://your-backend-domain.com/api/health
```

If you don’t have a `/api/health` route, just verify any route like:

```text
https://your-backend-domain.com/api/auth/me
```

---

### 4) Deploy the frontend (Vercel/Netlify)

Deploy the `frontend` folder.

Set these environment variables:

```dotenv
VITE_API_BASE_URL=https://your-backend-domain.com/api

VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://...  # Sepolia RPC (same provider is fine)
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

Build command:

```bash
npm run build
```

Output folder:

```text
dist
```

---

### 5) Final checklist (common production mistakes)

- `VITE_API_BASE_URL` **must end with** `/api` (because backend routes are under `/api/*`).
- `CORS_ORIGIN` must be your **exact** frontend domain (including `https://`).
- If login works but refresh logs you out, verify the backend is reachable and `JWT_SECRET` is set.
- If donate/create-on-chain fails: wallet must be on **Sepolia**, contract address must be correct, and the account needs **SepoliaETH for gas**.

---

### Optional: deploy to localhost (for demos)

If you want `--network localhost`, run Hardhat node first:

```bash
cd blockchain
npx hardhat node
```

Then in another terminal:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

Use RPC `http://127.0.0.1:8545` and chain id `31337` for local testing.

## Common problems

### Port already in use (EADDRINUSE)

- Backend default port is `5000`.
- Frontend default port is `5173` (Vite may switch to `5174/5175/...` automatically).

Fix: close the process using the port, or change the port in your env/config.

### Images not showing

Campaign images require a **direct image URL** (ends with `.jpg`, `.png`, `.webp`, etc.).

Examples that often fail:

- Google Drive “view” links
- GitHub “blob” links

Tip: use a direct hosted image link or an IPFS URL (`ipfs://...`).

### Explore vs Dashboard

- Explore shows **approved** campaigns.
- Creators can still see their ownz campaigns in Dashboard (including pending/unapproved).

## Notes

- Frontend uses a shared Axios client in [frontend/src/lib/api.ts](frontend/src/lib/api.ts)
- Roles must be lowercase: `donor`, `creator`, `admin`
