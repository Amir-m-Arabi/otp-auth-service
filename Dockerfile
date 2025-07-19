# Use an official Node.js runtime as the base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Run Prisma generate to create Prisma Client
RUN npx prisma generate

# Build the app (compile TypeScript to JavaScript)
RUN npm run build

# Expose the port your app runs on
EXPOSE 5002

# Run the app (start from compiled JavaScript)
CMD ["npm", "run", "prod"]
