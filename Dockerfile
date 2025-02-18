# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy the rest of the application files
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Define environment variables (if needed)
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
