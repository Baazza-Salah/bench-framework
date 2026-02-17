FROM node:18-alpine

WORKDIR /app

COPY package.json .
COPY package-lock.json* ./

RUN npm install

COPY . .

# Expose port 5173 for Vite
EXPOSE 5173

# Run dev server
CMD ["npm", "run", "dev"]
