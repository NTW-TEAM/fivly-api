# Base image
FROM node:20-bullseye-slim

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Copy the .env
COPY .env.prod ./.env

# Creates a "dist" folder with the production build
RUN npm run build

# Verify the content of the dist directory
RUN ls -la dist

# Expose the port on which the app will run
EXPOSE 3189

# Start the server using the production build
CMD ["npm", "run", "start:prod"]
