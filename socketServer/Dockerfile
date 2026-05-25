FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Set environment variables
ENV NODE_ENV production
ENV PORT 8000

# Add user so we don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 socketjs
USER socketjs

EXPOSE 8000

CMD ["node", "index.js"]
