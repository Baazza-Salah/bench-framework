FROM node:18-alpine

WORKDIR /app

COPY package.json .
COPY package-lock.json* ./

RUN npm install

COPY . .

# Expose port 5000
EXPOSE 5000

# Run the application
CMD ["npm", "run", "dev"]
