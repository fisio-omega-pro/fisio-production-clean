FROM node:20-slim
WORKDIR /usr/src/app
ENV NODE_ENV=production
# 🔥 FORZAR LIMPIEZA COMPLETA - Sin cache
COPY package*.json ./
# En Cloud Build hemos visto fallos de permisos con `npm ci` al limpiar ciertos paquetes
# (p.ej. `strnum`). `npm install` es más tolerante y mantiene compatibilidad.
RUN npm install --omit=dev --no-audit --no-fund --force
# Copiamos solo el backend para minimizar el contexto
COPY backend ./backend
ENV PORT 8080
EXPOSE 8080
CMD [ "node", "backend/server-simple.js" ]
