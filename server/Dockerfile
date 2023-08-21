FROM node:18.12.1

WORKDIR /app

COPY package.json .

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

EXPOSE 4000
EXPOSE 8080

CMD ["npm","run","start:dev"]

# Expose a port if your application needs it
# EXPOSE 3000

# Command to start your application
# CMD ["npm", "start"]