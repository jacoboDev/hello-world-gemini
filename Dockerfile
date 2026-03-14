# 1. Usamos la imagen oficial de Node 24 Slim,
# más estable que Alpine y mucho más ligera que la imagen completa.
FROM node:24-slim

# 2. Instalamos pnpm
RUN npm install -g pnpm

# 3. Establecemos el directorio de trabajo
WORKDIR /app

# 4. Copiamos los archivos de dependencias en la raíz del contenedor.
# Esto es importante para aprovechar la cache de Docker y no tener que reinstalar
# cada vez que cambiamos el código, solo cuando cambiamos las dependencias.
# Si no cambias las librerías, Docker se salta el paso 5 en el siguiente build.
COPY package.json pnpm-lock.yaml* ./

# 5. Instalamos dependencias de forma estricta
# Si el lockfile no coincide con el package.json, el build falla (seguridad total)
# para evitar mezclar instalaciones locales con las del contenedor.
RUN pnpm install --frozen-lockfile

# 6. Copiamos el resto del proyecto
# Gracias al volumen en docker-compose, los cambios se verán en tiempo real
COPY . .

# 7. Exponemos el puerto de Next.js
EXPOSE 3000

# 8. Comando para desarrollo (permite ver cambios sin reconstruir la imagen)
CMD ["pnpm", "dev"]
