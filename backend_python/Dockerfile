# Usamos Python oficial
FROM python:3.11-slim

# Evita que Python genere archivos .pyc innecesarios y asegura que los logs salgan directos
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Directorio de trabajo
WORKDIR /app

# Instalamos dependencias de sistema relacionadas con lenguaje C
RUN apt-get update && apt-get install -y --no-install-recommends gcc python3-dev && rm -rf /var/lib/apt/lists/*

# Copiamos PRIMERO el archivo de dependencias
# Al igual que con pnpm, esto aprovecha la caché de Docker
COPY requirements.txt .

# 6. Instalamos las librerías
# Usamos --no-cache-dir para que la imagen sea lo más pequeña posible
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el resto del código
COPY . .

# Lanzamos el servidor en el puerto 8000
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
