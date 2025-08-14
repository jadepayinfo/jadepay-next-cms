# Use official Node.js image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and yarn.lock first to install dependencies
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the application files
COPY . .

# Expose port 3000 to allow access to the app
EXPOSE 3000

# Start the Next.js app in development mode
CMD ["yarn", "dev"]
