# Use the Node.js 18 image as the base
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Expose the application port
EXPOSE 9101

# Start the Next.js application
CMD ["npx", "next", "start", "-p", "9101"]
