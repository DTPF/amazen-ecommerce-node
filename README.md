# Amazen E-commerce — Backend

REST API for the Amazen e-commerce platform. Handles products, categories, users, orders, and CMS content with role-based access control.

## Features

- RESTful API at `/api/v1/`
- User authentication with JWT and role-based authorization
- Product and category CRUD with image uploads
- Order management
- CMS content endpoints for the admin panel
- MongoDB with Mongoose ODM

## Tech Stack

- **Runtime:** Node.js, Express.js
- **Language:** JavaScript
- **Database:** MongoDB + Mongoose
- **Auth:** JWT
- **File uploads:** Multer

## Getting Started

1. Clone the repo: `git clone https://github.com/DTPF/amazen-ecommerce-node.git`
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure your environment variables
4. Make sure MongoDB is running
5. Start the dev server: `npm run dev`

The API runs at `http://localhost:4000`

## Related

- [amazen-ecommerce](https://github.com/DTPF/amazen-ecommerce) — React frontend
