# Stage 1: Install dependencies and build the app
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json/yarn.lock
COPY package*.json ./

# Install dependencies
RUN npm install -f

# Copy the rest of the app code
COPY . .

# Build the Next.js app for production
RUN npm run build

# Stage 2: Create a lightweight production image
FROM node:18-alpine AS runner

# Set working directory
WORKDIR /app

# Install only production dependencies
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy Next.js build
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Set environment variable to run in production mode
ENV NODE_ENV=production

# Expose the port on which the app will run
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start"]