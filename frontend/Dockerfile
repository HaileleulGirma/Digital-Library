# Use Node 20 to match your local environment
FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Build the TypeScript/React code for production
RUN npm run build

# Expose the port defined in docker-compose.yml
EXPOSE 3000

# Run the Vite preview server, forcing it to host on port 3000
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]