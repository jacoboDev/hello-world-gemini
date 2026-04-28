import docx
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Cargar variables de entorno desde .env.local
load_dotenv(".env.local")

# Configurar API Key
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("No se encontró GEMINI_API_KEY en .env.local")
genai.configure(api_key=api_key)

# 1. Extraer texto del Word
def get_docx_text(path):
    doc = docx.Document(path)
    return "\n".join([para.text for para in doc.paragraphs])

# Usamos la ruta real del documento
doc_path = r"docs/content/Diccionario de Competencias Digitales 3 con IA + ÁREA IA Generativa y Agéntica.docx"
print(f"Leyendo documento: {doc_path}")
texto_digcomp = get_docx_text(doc_path)

# 2. Contar tokens
model = genai.GenerativeModel('gemini-2.5-flash')
conteo = model.count_tokens(texto_digcomp)
print(f"Tu documento tiene {conteo.total_tokens} tokens.")
