FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies first
COPY package.json package-lock.json* ./
RUN npm ci

# Copy all source files
COPY . .

# Build Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Expose production port
EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

# Start production server
CMD ["npm", "run", "start"]
