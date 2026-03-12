import os
import shutil
import google.generativeai as genai
from fastapi import FastAPI, UploadFile, File

app = FastAPI()

# 1. Función para obtener la clave de forma segura
def get_api_key():
    key = os.getenv("GEMINI_API_KEY")
    return key

@app.post("/analizar")
async def analizar_pdf(cv: UploadFile = File(...)):
    api_key = get_api_key()
    
    if not api_key:
        return {"error": "No se encontró la API KEY en el servidor de Python"}

    # Configuramos justo antes de usarlo
    genai.configure(api_key=api_key)
    
    # Guardamos el archivo temporalmente
    temp_path = f"/tmp/{cv.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(cv.file, buffer)

    try:
        # 2. Subir y procesar
        file_uploaded = genai.upload_file(path=temp_path, display_name="CV_Python")
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        response = model.generate_content([
            file_uploaded,
            "Analiza este CV y devuelve un JSON con: nombre_completo, email, habilidades_principales y resumen_perfil."
        ])
        
        return {"data": response.text}
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)