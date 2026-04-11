# Stage 1: Install dependencies
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Keep this here for prod builds, but dev will branch off before this
RUN npm run build 

# Stage 2: Development (Target this in docker-compose)
FROM node:20-alpine AS dev
WORKDIR /app
# Copy node_modules from the builder stage to save time
COPY --from=builder /app/node_modules ./node_modules
COPY . .
# Vite needs --host to be accessible from outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Stage 3: Production
FROM node:20-alpine AS prod
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 3000
CMD ["node", "build"]