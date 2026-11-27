# Smart Multi-Field Sports Analytics System
### Uganda Christian University (UCU) Sports Department

A university sports video and statistical analytics platform powering automated multimodal match event extraction, coach-analyst statistical fusion, grounded AI match report writing with strict numerical verification, student-athlete progression portals with granular consent controls, and an admin-mediated scout firewall.

---

## Key Features

1. **Multi-Role Access Control (ABAC)**
   - **Coach**: Match setup, offline box-score tracking, video upload, fusion conflict resolution, report review, and publication.
   - **Student-Athlete (Player)**: Personalized match performance, tagged video clips, coach appraisals, season progression charts, self-evaluation submissions, and privacy consent toggles.
   - **Scout**: Anonymized talent directory with position and metric filters. PII is strictly shielded; contact is routed solely through university sports administrators.
   - **Administrator**: Scout accreditation approvals, team and season oversight, and immutable compliance audit log stream.

2. **Multimodal Video Analysis via Gemini (`@google/genai`)**
   - Video event extraction with timestamps, player shirt references, confidence scores, and visual descriptions.
   - Exponential backoff with random jitter on `429` and `503` rate limits.
   - Low quality detection (`score_0_to_1 < 0.4`) automatically flags footage constraints and offers manual entry mode.

3. **Statistical Fusion Conflict Engine**
   - Compares Gemini-detected video events against coach-entered box scores per shirt number.
   - If tallies differ, creates an actionable `FusionFlag` with both counts and direct timestamp jump links.
   - *Core Invariant: Never overwrite coach tallies silently.*

4. **Grounded Match Report Writer & Strict Number Checker**
   - Report generator receives only verified match data.
   - Deterministic Number Checker verifies every number in the drafted report against the source dataset; any ungrounded claim is flagged and isolated.

5. **Student Privacy & Scout Firewall**
   - Scouts see **nothing** until BOTH the athlete enables `scoutVisible=true` AND an administrator grants scout accreditation.

---

## Project Structure

```
├── .env.example              # Environment variables template (GEMINI_MODEL, GEMINI_API_KEY)
├── firebase.json             # Firebase configuration (Firestore, Storage, Functions, Emulators)
├── firestore.rules           # Attribute-Based Access Control (ABAC) Firestore security rules
├── storage.rules             # Cloud Storage security rules for video uploads
├── package.json              # App scripts and dependencies
├── server.ts                 # Full-stack Express server with Vite dev middleware
├── functions/                # Cloud Functions in TypeScript (onFinalize video analysis, publish tags)
│   ├── package.json
│   ├── tsconfig.json
│   └── src/index.ts
├── test/                     # Unit test suite for Fusion Engine and Number Checker
│   └── run-tests.ts          # 5 concrete test scenarios (13 test assertions)
└── src/
    ├── types/index.ts        # TypeScript data contracts & Gemini JSON schemas
    ├── lib/
    │   ├── fusionEngine.ts   # Statistical Fusion comparison logic
    │   ├── numberChecker.ts  # Strict Grounded Number Checker
    │   ├── mockData.ts       # FAKE seed data for UCU Canons & UCU Cardinals
    │   └── storage.ts        # Offline-first persistence and audit logging
    └── components/
        ├── Navbar.tsx        # 3-Zone navigation with fast role & sport switchers
        ├── VideoPlayer.tsx   # Video player with timeline markers & clip seeking
        ├── CoachView.tsx     # Match deck, offline counters, fusion matrix & report sign-off
        ├── PlayerPortal.tsx  # Athlete stats, tagged video highlights & consent switches
        ├── ScoutView.tsx     # Scout discovery directory & admin inquiry modal
        ├── AdminView.tsx     # Scout accreditation, team management & audit logs
        └── AuditLogModal.tsx # Full-screen compliance audit viewer
```

---

## Local Development & Testing

### 1. Run Unit Tests (Fusion Logic & Number Checker)
```bash
npm run test
```
Executes all 5 test scenarios covering grounded report validation, hallucination detection, sentence isolation, concordant fusion, and discrepancy flag generation.

### 2. Start Full-Stack Development Server
```bash
npm run dev
```
Starts the full-stack Express server mounting Vite middlewares on port `3000`.

### 3. Build for Production
```bash
npm run build
```

---

## Firebase Deployment Steps

1. **Install Firebase CLI & Login**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Initialize or Link Firebase Project**
   ```bash
   firebase use <your-project-id>
   ```

3. **Deploy Security Rules**
   ```bash
   firebase deploy --only firestore:rules,storage
   ```

4. **Deploy Cloud Functions**
   ```bash
   cd functions
   npm install
   firebase functions:config:set gemini.key="YOUR_GEMINI_API_KEY" gemini.model="gemini-3.8-flash"
   cd ..
   firebase deploy --only functions
   ```

5. **Deploy Frontend to Firebase Hosting**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

6. **Local Emulator Suite**
   ```bash
   firebase emulators:start
   ```
