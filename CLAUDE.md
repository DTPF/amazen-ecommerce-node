# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Amazen is an e-commerce REST API backend built with Express.js and MongoDB (Mongoose ODM). It provides user authentication, product management, shopping cart, and order processing.

## Commands

- `npm run dev` — Start dev server with nodemon (auto-reload)
- `npm start` — Start production server
- No test framework is configured

## Setup

1. Copy `config-example.js` → `config.js` and `env-example.js` → `env.js`
2. MongoDB must be running (default: `mongodb://localhost:27019/amazen`)
3. `npm install` then `npm run dev`
4. API base URL: `http://localhost:3994/api/v1`

## Architecture

Classic MVC pattern — all plain JavaScript (no TypeScript, no ESLint):

- **`index.js`** — Entry point: connects to MongoDB, starts HTTP server
- **`app.js`** — Express setup: body-parser, CORS headers, route mounting under `/api/v1`
- **`config.js`** / **`env.js`** — Server config (ports, DB) and secrets (JWT key, bcrypt salt rounds). Both are gitignored; use the `-example.js` variants as templates
- **`controllers/`** — Business logic per domain (auth, user, product, cart, order)
- **`models/`** — Mongoose schemas (User, Product, Cart, Order)
- **`routers/`** — Express route definitions mapping HTTP methods to controller functions
- **`middlewares/authenticated.js`** — Two guards: `ensureAuth` (any valid JWT) and `ensureAdminAuth` (requires `role === "admin"`)
- **`services/jwt.js`** — Creates and decodes access tokens (3h expiry) and refresh tokens using `jwt-simple`
- **`responsesMessages/`** — Centralized response message strings (in Spanish)
- **`uploads/`** — File storage for avatar images (`uploads/avatar/`) and product images (`uploads/products/`). File uploads use `connect-multiparty`

## Key Patterns

- **Auth flow**: Sign up → bcrypt-hashed password stored → Sign in returns `accessToken` + `refreshToken` → Client sends `Authorization` header → `/refresh-access-token` endpoint renews expired tokens
- **Role-based access**: Admin-only routes (product CRUD, user listing, role changes) use `ensureAdminAuth`; user routes use `ensureAuth`
- **Response format**: `{ status, message, [data] }` — status codes and messages are returned in the JSON body
- **Controller style**: Callback-based with `async` functions; errors caught via try/catch returning status codes directly
- **Image handling**: Uploaded via multiparty middleware, stored on disk with generated filenames, served via GET endpoints (`/get-avatar/:name`, `/get-product-image/:name`)
