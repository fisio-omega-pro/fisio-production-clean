FROM node:20-slim
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
# Copiamos solo el backend para minimizar el contexto
COPY backend ./backend
ENV PORT 8080
EXPOSE 8080
CMD [ "node", "backend/server.js" ]
