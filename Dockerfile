# 1. Usamos la imagen oficial de Node 24 Alpine
FROM node:24-alpine

# 2. Establecemos el directorio de trabajo
WORKDIR /app

# 3. Instalamos las dependencias necesarias para Alpine
# (algunas librerías de Node necesitan estas herramientas para compilar)
RUN apk add --no-cache libc6-compat

# 4. Copiamos los archivos de dependencias
COPY package.json package-lock.json* ./

# 5. Instalamos todas las dependencias
RUN npm install

# 6. Copiamos el resto del proyecto
# Gracias al volumen en docker-compose, los cambios se verán en tiempo real
COPY . .

# 7. Exponemos el puerto de Next.js
EXPOSE 3000

# 8. Comando para desarrollo (permite ver cambios sin reconstruir la imagen)
CMD ["npm", "run", "dev"]