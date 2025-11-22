FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package files first
COPY package*.json ./

# Install deps (no dev deps in container)
RUN npm ci --omit=dev || npm install --omit=dev

# Copy source
COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
