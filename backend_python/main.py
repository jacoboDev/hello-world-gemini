import os
import shutil
import time
import random
import google.generativeai as genai
from fastapi import FastAPI, UploadFile, File

app = FastAPI()



# 1. Función para obtener la clave de forma segura
def get_api_key():
    key = os.getenv("GEMINI_API_KEY")
    return key


# -- Exponential Backoff con CAP en Python -- #
async def generar_con_backoff(model, contenido, max_intentos=6):
    espera = 2.0 # segundos
    for i in range(max_intentos):
        try:
            # Intentamos generar el contenido
            return model.generate_content(contenido)
        except Exception as e:
            # Si es el último intento, nos rendimos
            if i == max_intentos -1:
                raise e
            
            # Calculamos espera + jitter (azar)
            tiempo_total = espera + random.uniform(0, 1)
            print(f"Python: Error en Gemini. Reintento {i+1} en {int(tiempo_total)}s...")
            
            time.sleep(tiempo_total)
            
            # Lógica del CAP a 8 segundos
            if espera < 8:
                espera *= 2
            continue
    


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
        
        prompt = [
            file_uploaded,
            "Analiza este CV y devuelve un JSON con: nombre_completo, email, habilidades_principales y resumen_perfil."
        ]

        response = await generar_con_backoff(model, prompt)
        
        return {"data": response.text}
    except Exception as e:
        return {"error": str(e)}       
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)