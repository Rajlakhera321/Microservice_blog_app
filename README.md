# Microservice_blog_app

This project is a microservice-based architecture for a blogging platform. It consists of three independent services:

Author Service – Manages author profiles and authentication.

User Service – Handles user registration, profiles, and interactions.

Blog Service – Responsible for blog creation, updates, and listing.

Run below commands inside every service :- 

# Install dependencies
npm install

# Build the service
npm run build

# Start in development mode
npm run dev

.env file for author and blog service

DB_URL=
PORT=
JWT_SEC=
CLOUD_NAME=
CLOUD_API_KEY=
CLOUD_SECRET_KEY=
USER_SERVICE=
REDIS_URL=
RB_PROTOCOL=
RB_HOSTNAME=
RB_USERNAME=
RB_PASSWORD=

.env file for user service

PORT=
MONGO_URL=
JWT_SEC=
CLOUD_NAME=
CLOUD_API_KEY=
CLOUD_SECRET_KEY=
GOOGLE_CLOUD_ID=
GOOGLE_CLOUD_SECRET=
GOOGLE_GEMINI_KEY=
