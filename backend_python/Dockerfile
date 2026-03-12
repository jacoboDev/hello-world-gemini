# Usamos Python oficial
FROM python:3.11-slim

# Directorio de trabajo
WORKDIR /app

# Instalamos lo necesario
RUN pip install fastapi uvicorn google-generativeai python-multipart

# Copiamos el código
COPY main.py .

# Lanzamos el servidor en el puerto 8000
CMD ["uvicorn", "main.py", "--host", "0.0.0.0", "--port", "8000"]