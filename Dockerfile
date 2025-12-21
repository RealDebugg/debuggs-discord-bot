FROM node:18-alpine
WORKDIR /usr/src/app

COPY package.json package-lock.json* ./
RUN npm install
COPY . .

# Expose the API port
EXPOSE 5050
ENV PORT=5050

CMD ["npm", "run", "start"]
