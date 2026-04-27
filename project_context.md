# Contexto del Proyecto: Hello World Gemini

Este proyecto es una aplicación Fullstack "prueba de concepto" diseñada para interactuar con la Inteligencia Artificial de Google (**Gemini 2.5 Flash**) utilizando dos ecosistemas diferentes: **Node.js** y **Python**. Sirve como un entorno de experimentación estructurado sobre Docker para extraer información de documentos PDF (Currículums) y realizar consultas simples a un LLM, almacenando todos los resultados en una base de datos en la nube (**Supabase**).

## 🚀 Funcionalidades Principales

1.  **Clima Logger (Prueba Básica de Gemini):**
    *   Un botón en la interfaz web permite preguntar a Gemini por el clima actual en Barcelona.
    *   La respuesta generada por la IA se guarda automáticamente en la base de datos de Supabase en la tabla `consultas_clima`.

2.  **Análisis de Currículums (CVs) con IA:**
    *   La aplicación permite subir un archivo PDF (un currículum vitae) y extraer información estructurada (nombre, habilidades, resumen) en formato JSON usando Gemini.
    *   **Doble Motor de Procesamiento:** El usuario puede elegir con qué "motor" o backend procesar el PDF:
        *   **Vía Node.js:** El archivo se procesa de forma nativa a través de la API de Next.js (`route.ts`) utilizando el SDK de `@google/generative-ai/server`.
        *   **Vía Python:** La API de Next.js actúa como *Gateway* y reenvía el archivo a un microservicio escrito en Python (FastAPI), que a su vez se comunica con Gemini usando la librería de Python `google-generativeai`.
    *   Ambos motores guardan el JSON resultante en Supabase en la tabla `cv_analizados`, registrando qué lenguaje se utilizó para el análisis.

## 🛠️ Tecnologías y Arquitectura

*   **Frontend y API Gateway:** Next.js (React) con TypeScript.
*   **Microservicio Backend:** Python con FastAPI.
*   **Base de Datos:** Supabase (PostgreSQL como servicio).
*   **IA:** Google Gemini API (modelo `gemini-2.5-flash`).
*   **Orquestación y Entorno:** Docker y Docker Compose para garantizar un entorno unificado y evitar el clásico "en mi máquina sí funciona".

---

## 📂 Estructura de Carpetas

La arquitectura sigue una separación clara entre el frontend (Next.js) y el microservicio de procesamiento (Python), orquestados desde la raíz por Docker.

```text
hello-world-gemini/
│
├── docker-compose.yml          # Orquestador que levanta los contenedores 'app' (Node) y 'python_app' (FastAPI).
├── README.md                   # Documentación principal con instrucciones de Docker y pnpm.
├── package.json                # Dependencias de Node.js gestionadas con pnpm.
├── pnpm-lock.yaml              # Archivo de bloqueo (lockfile) estricto para las dependencias.
├── .env.local                  # Archivo (ignorado en git) con variables de entorno (Gemini API Key, Supabase Keys).
│
├── src/                        # 🟢 Ecosistema Node.js (Next.js)
│   ├── app/
│   │   ├── page.tsx            # Frontend: Interfaz principal con los botones y formularios de subida de PDF.
│   │   ├── layout.tsx          # Estructura HTML base de la aplicación.
│   │   └── api/
│   │       └── clima/
│   │           └── route.ts    # Backend Node: Endpoints GET (Clima) y POST (Recibe el PDF y decide si lo procesa en Node o lo manda a Python).
│   └── lib/
│       └── supabase.ts         # Cliente de conexión con Supabase.
│
├── backend_python/             # 🔵 Ecosistema Python (Microservicio)
│   ├── main.py                 # Servidor FastAPI con el endpoint `/analizar` que procesa el PDF con Gemini.
│   ├── requirements.txt        # Dependencias de Python.
│   └── Dockerfile              # Instrucciones para crear la imagen Docker del backend de Python.
│
└── public/                     # Archivos estáticos públicos (imágenes, fuentes, favicon).
```
