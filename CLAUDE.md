# Noiseroom

A zero-knowledge encrypted messenger. The server stores all chats and messages, but only as ciphertext. Without the local vocabulary (cipher config), messages cannot be decrypted — the server is intentionally blind.

## Concept

Users design their own cipher per chat using layered encryption steps. The cipher vocabulary lives only on the user's device and is shared out-of-band via QR code.

### Auth
- Username + password + PIN
- PIN is used for local vault encryption of vocabulary

### Encryption layers (each optional, applied in order)
| Layer | Name | Description |
|-------|------|-------------|
| 0 | Alphabet | Choose base alphabet: Cyrillic or Latin |
| 1 | Substitution | Shuffle letters/numbers/symbols in the alphabet |
| 2 | Homophones | Map popular letters to multiple possible symbols |
| 3 | Space replacement | Replace spaces with specific symbol combinations |
| 4 | Null symbols | Insert decoy/filler characters into ciphertext |

### Vocabulary (cipher config)
- Stored locally on-device only — never sent to the server
- Each chat has its own vocabulary
- New members receive the vocabulary via QR code scan

## Architecture

### Key principle
**All encryption/decryption is client-side.** The server receives and stores opaque ciphertext blobs. Never add cipher logic to the backend.

### Stack
- **Backend**: NestJS, Prisma ORM, JWT auth, WebSockets (Socket.io)
- **Mobile**: React Native (not yet scaffolded, lives in `apps/mobile`)
- **Monorepo**: Yarn workspaces

### Monorepo structure
```
apps/
  backend/   — NestJS API
  mobile/    — React Native app (empty, to be scaffolded)
infra/       — infrastructure config
```

## UI / Design

Terminal / CLI aesthetic throughout:
- Near-black background
- Acid green + acid pink accent colors
- Monospace font everywhere
- No rounded consumer-app UI — flat, text-heavy, hacker terminal feel

## Dev commands

```bash
yarn backend        # start backend in watch mode
yarn backend:build  # build backend
yarn mobile         # start mobile app
```
