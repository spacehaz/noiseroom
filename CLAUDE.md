# Noiseroom

A zero-knowledge encrypted messenger. The server stores all chats and messages, but only as ciphertext. Without the local vocabulary (cipher config), messages cannot be decrypted — the server is intentionally blind.

## Concept

Users design their own cipher per chat using layered encryption steps. The cipher vocabulary lives only on the user's device and is shared out-of-band via QR code.

### Auth
- Username + password + PIN
- PIN is used for local vault encryption of vocabulary
- All vault keys are namespaced by username — multiple accounts on the same device are fully isolated

### Encryption layers (each optional, applied in order)
| Layer | Name | Description |
|-------|------|-------------|
| 0 | Alphabet | Choose base alphabet: Cyrillic or Latin |
| 1 | Substitution | Auto (cross/shuffle) or manual drag-and-drop assignment |
| 2 | Homophones | Map popular letters to multiple possible symbols |
| 3 | Space replacement | Replace spaces with specific symbol combinations |
| 4 | Null symbols | Insert decoy/filler characters into ciphertext |

### Vocabulary (cipher config)
- Stored locally on-device only — never sent to the server
- Each chat has its own vocabulary
- New members receive the vocabulary via QR code (rotates every 2s, expires after 30s)

## Architecture

### Key principle
**All encryption/decryption is client-side.** The server receives and stores opaque ciphertext blobs. Never add cipher logic to the backend.

### Stack
- **Backend**: NestJS, Prisma ORM, JWT auth, WebSockets (Socket.io)
- **Mobile**: React Native (Expo Router, styled-components, Redux, React Query, Reanimated)
- **Cipher**: `packages/cipher` — local package, never imported by backend
- **Monorepo**: Yarn workspaces

### Monorepo structure
```
apps/
  backend/   — NestJS API
  mobile/    — React Native app (Expo managed workflow)
packages/
  cipher/    — client-side cipher engine (encrypt, decrypt, vocabulary generators)
infra/
  backup.sh  — daily DB backup script for VPS
```

## Backend

### REST endpoints
- POST /auth/register
- POST /auth/login
- GET/POST /chats
- GET /chats/:id
- POST /chats/:id/join
- DELETE /chats/memberships
- GET /chats/:id/messages
- POST /chats/:id/messages

### WebSocket events
- Client → server: `join_chat` { chatId }
- Client → server: `send_message` { chatId, ciphertext }
- Server → client: `new_message`

### Rate limiting
- Global: 60 req/min per IP
- Auth endpoints (/auth/register, /auth/login): 5 req/min per IP

### Infrastructure
- Docker Compose: `db` (Postgres 16) + `backend` (NestJS)
- DB credentials via `.env` (DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET)
- Deployed on VPS at app.noiseroom.tech, nginx with SSL + WebSocket headers
- CI/CD: GitHub Actions → SSH → git pull → docker compose up --build -d

## Mobile screens
```
(auth)/
  login/          — username + password
  register/       — username + password
  set-pin/        — set PIN after register
  enter-pin/      — unlock vault, load vocabularies into Redux

(app)/
  chats/          — chat list
  create-chat/    — 7-step wizard (name, alphabet, substitution, homophones, space, null symbols, review)
  chat/[id]/      — messages, real-time via WebSocket
  chat/[id]/share-vocab/  — rotating QR code to share vocabulary
  join-chat/      — QR scanner, joins chat and receives vocabulary
  profile/        — logout, leave all chats
  search/         — user search
  user/[username]/
```

## UI / Design

Terminal / CLI aesthetic throughout:
- Near-black background (#0a0a0a)
- Acid green (#39ff14) + acid pink (#ff2d78) accent colors
- SpaceMono font everywhere
- No rounded consumer-app UI — flat, text-heavy, hacker terminal feel

## Dev commands

```bash
yarn backend        # start backend in watch mode
yarn backend:build  # build backend
yarn mobile         # start mobile app
nvm use 20          # required before yarn commands
```

## Sharing (no Apple Developer account)
- iOS: Expo Go + `eas update --branch main` → share `exp://u.expo.dev/...` link
- Android: `eas build --platform android --profile preview` → share APK link
- Project ID: 15e94396-47a4-47c6-9a37-1251a05d35ff (spacehaz on expo.dev)
