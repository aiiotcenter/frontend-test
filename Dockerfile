# frontend/Dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build  # Add this line to create the production build
EXPOSE 3000
CMD ["npx", "next", "start", "-p", "3000"]
