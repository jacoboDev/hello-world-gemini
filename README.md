This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Este proyecto es una aplicación Fullstack que utiliza **Next.js** para el frontend, **FastAPI (Python)** para el procesamiento de PDFs con la IA de Gemini, y **Supabase** para el almacenamiento de datos.



Necesitas tener instalado:

* [Docker Desktop](https://www.docker.com/products/docker-desktop/):
Desde Windows o macOS (no aplica a Linux)

* Docker Engine y plugin de Docker Compose (V2):
(Únicamente en Linux). Instrucciones más abajo en sección de Docker.

* WSL 2:
(Únicamente en Windows) Para situar la carpeta raíz del proyecto y correr sobre kernel de Linux los contenedores de Docker
* Configurar .env.local con las API Keys a partir del archivo dummy .example.env.local

* Extensión "EditorConfig" para VSCode / Cursor:

Para limpiar configuraciones de Mac/Windows y evitar problemas de formato en Linux (Docker),
y para mantener un formato consistente en todo el proyecto, independientemente de la configuración del editor de cada desarrollador.

* Node.js (Versión 24 o superior).

* pnpm `npm install -g pnpm` para que el VS Code entienda las librerías y autocomplete.

* NO hacer `npm instal` ni `npmn install` en local. Cualquier librería nueva se instala directamente DENTRO del contenedor para ser acorde a Linux y generar un lockfile (pnpm-lock.yaml) preciso. Instrucciones de instalación en apartado de Docker. El proyecto nunca debe tener un package-lock.json ya que este es generado por npm, y debe ser borrado.


La aplicación estará disponible en:

Frontend: http://localhost:3000

API Python: http://localhost:8000

Documentación API (Swagger): http://localhost:8000/docs



# Estructura del proyecto
/src - Aplicación Next.js (Frontend y API Gateway)

/backend_python - Microservicio de Python para procesamiento de IA

docker-compose.yml - Orquestación de contenedores


--------------------------------------------------------------------------------------------------



First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev  # Recomendado para gestión eficiente, aislada y estricta de dependencias
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.




# 🐳 Docker

En este proyecto, utilizamos Docker para estandarizar el entorno de desarrollo. A continuación, se detallan los conceptos clave y los comandos principales.

## Conceptos Básicos

* **Imagen:** Es de solo lectura, no cambia y contiene todo lo necesario para que el programa funcione (sistema operativo, librerías, código). Si se borra y vuelve a crear, vuelve a empezar de cero; no guarda estado.
* **Volumen:** Memoria donde se guardan los datos que cambian. Es un espacio de lectura/escritura externo a la imagen. Permite que los datos "sobrevivan" aunque se apague el contenedor. Hace de espejo con nuestra carpeta raíz mediante `.:/app` (todo lo de la raíz . se copia en un directorio /app dentro del contenedor).
* **Contenedor:** Es una instancia de la imagen "encendida" que consume RAM y CPU.

---

## Comandos de Gestión

### 🛠 Compilación y Encendido
| Acción | Comando |
| :--- | :--- |
| **Compilar** | `docker compose up --build` |
| **Levantar (Encender)** | `docker compose up` |

### ⏸ Pausar y Reanudar
* **Pausar (pausas cortas):** `Ctrl + C` o `docker compose stop`
* **Reanudar (después del stop):** `docker compose start`

### ⏹ Finalizar y Limpiar
* **Finalizar:** (Al terminar el día o una funcionalidad). Elimina contenedores y redes, pero mantiene volúmenes e imágenes.
    ```bash
    docker compose down
    ```
* **Borrar reconstrucción completa:** (Para cambiar versiones de Node o Dockerfile). Borra contenedores y volúmenes anónimos para instalar desde cero.
    ```bash
    docker compose down -v
    ```

---

## Interacción con el Contenedor

* **Entrar al contenedor:**
    ```bash
    docker compose exec app bash
    ```
* **Ver logs en tiempo real:**
    ```bash
    docker compose logs -f
    ```
* **Instalar librerías "en caliente" (Node):**
    ```bash
    docker compose exec app pnpm add <paquete>
    ```
* **Eliminar librería (Node):**
    ```
    docker compose exec app pnpm remove <nombre-paquete>
    ```
* **Instalar librerías "en caliente" (Python):**
    ```bash
    docker compose exec python_app pip install <paquete>
    ```
    ```
    docker compose exec python_app sh -c "pip freeze > requirements.txt"
    ```
* **Eliminar librería (Python):**
    ```
    docker compose exec python_app pnpm remove <nombre-paquete>
* **Revisar archivos para .dockerignore:**
    ```bash
    docker compose exec python_app ls -a /app
    ```

**Acceso a la App:** [http://localhost:3000](http://localhost:3000)

---

## 🧹 Mantenimiento y Limpieza de Caché

Es recomendable limpiar imágenes huérfanas que se acumulan con cada `up --build`.

| Propósito | Comando |
| :--- | :--- |
| **Ver espacio total ocupado** | `docker system df` |
| **Ver imágenes huérfanas** | `docker images -f "dangling=true"` |
| **Ver volúmenes no usados** | `docker volume ls -qf dangling=true` |
| **Borrar todo lo no usado menos volúmenes** | `docker system prune` |
| Limpieza segura. Borra imágenes huérfanas (sin nombre), |
| contenedores detenidos y redes que no se usan. |
| No toca volúmenes. |
| **Borrar TODO (incluye volúmenes)** | `docker system prune -a --volumes` |
> **Cuidado:** Limpieza total. Borra todas las imágenes no utilizadas (tengan nombre o no) y todos los volúmenes, siempre que no estén asociados a un contenedor encendido.



## Instalación de Docker en Linux
Descargar y ejecutar el instalador oficial
```
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

Configurar permisos para no usar 'sudo' en los comandos del proyecto
```
sudo usermod -aG docker $USER
```
> **Importante**: Reinicia tu sesión (log out/log in) para aplicar los permisos de usuario.



# PYTHON BACKEND

Hacer `pip freeze > requirements.txt` dentro del contenedor tras instalar librerías nuevas.

Luego, en local, **con venv activado** hacer `pip install -r requirements.txt` para actualizar dichas librerías.

Instalar librerías en entorno virtual `python -m venv venv` local, únicamente para que VS Code reconozca librerías.


# pnpm requirements
- Delete package-lock.json
- Delete yarn.lock
- Delete node_modules if you must restart after an accidental npm
- There must be a pnpm-lock.yaml lockfile
- Always install libraries inside docker container
```
docker compose exec app pnpm add <library>
```
- Actualizar en local a partir del pnpm-lock.yaml actualizado: `pnpm install`
