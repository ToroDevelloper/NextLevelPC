# Guía de Despliegue - NextLevelPC

Esta guía detalla los pasos para desplegar la aplicación NextLevelPC en producción, utilizando **Render** para el Backend y **Netlify** para el Frontend.

## Prerrequisitos

1.  Tener el código subido a un repositorio de **GitHub**.
2.  Tener cuentas creadas en [Render](https://render.com/) y [Netlify](https://www.netlify.com/).
3.  Tener una base de datos MySQL accesible desde internet (ej. Railway, Aiven, o el mismo Render si ofrece MySQL).

---

## Parte 1: Despliegue del Backend (Render)

El backend es una aplicación Node.js/Express.

1.  Inicia sesión en **Render** y haz clic en **"New +"** -> **"Web Service"**.
2.  Conecta tu repositorio de GitHub.
3.  Configura el servicio con los siguientes parámetros:

    *   **Name:** `nextlevelpc-backend` (o tu preferencia)
    *   **Region:** Elige la más cercana a tus usuarios (ej. Ohio, Oregon).
    *   **Branch:** `main` (o `master`).
    *   **Root Directory:** `backend` (⚠️ Muy importante: indica que el backend está en esta subcarpeta).
    *   **Runtime:** `Node`.
    *   **Build Command:** `npm install`
    *   **Start Command:** `npm start`

4.  **Variables de Entorno (Environment Variables):**
    Ve a la sección "Environment" y añade las siguientes claves y valores:

    | Clave | Valor (Ejemplo) | Descripción |
    | :--- | :--- | :--- |
    | `NODE_ENV` | `production` | Indica entorno de producción |
    | `DB_HOST` | `autorack.proxy.rlwy.net` | Host de tu base de datos |
    | `DB_USER` | `root` | Usuario de la BD |
    | `DB_PASSWORD` | `tu_password_secreto` | Contraseña de la BD |
    | `DB_NAME` | `nextlevelpc` | Nombre de la base de datos |
    | `DB_PORT` | `3306` | Puerto de la BD |
    | `JWT_SECRET` | `clave_super_secreta_jwt` | Clave para firmar tokens |
    | `STRIPE_SECRET_KEY` | `sk_test_...` | Tu clave secreta de Stripe |
    | `FRONTEND_URL` | `https://tu-app.netlify.app` | **(Añadir después de desplegar Frontend)** URL de Netlify para permitir CORS |

5.  Haz clic en **"Create Web Service"**.
6.  Espera a que el despliegue finalice. Render te proporcionará una URL (ej. `https://nextlevelpc-backend.onrender.com`). **Copia esta URL**, la necesitarás para el frontend.

---

## Parte 2: Despliegue del Frontend (Netlify)

El frontend es una aplicación React construida con Vite.

1.  Inicia sesión en **Netlify** y haz clic en **"Add new site"** -> **"Import an existing project"**.
2.  Selecciona **GitHub** y elige tu repositorio.
3.  Configura el despliegue con los siguientes parámetros:

    *   **Base directory:** `fronted` (⚠️ Nota: La carpeta se llama `fronted` en el repo, no `frontend`).
    *   **Build command:** `npm run build`
    *   **Publish directory:** `dist`

4.  **Variables de Entorno:**
    Haz clic en **"Show advanced"** o ve a "Site configuration" -> "Environment variables" después de crear el sitio. Añade:

    | Clave | Valor | Descripción |
    | :--- | :--- | :--- |
    | `VITE_API_URL` | `https://nextlevelpc-backend.onrender.com` | **La URL de tu backend en Render** (sin barra al final) |
    | `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | Tu clave pública de Stripe |

5.  Haz clic en **"Deploy site"**.

---

## Parte 3: Conexión Final

Una vez que el frontend esté desplegado en Netlify, obtendrás una URL pública (ej. `https://nextlevelpc-frontend.netlify.app`).

1.  Vuelve al panel de **Render** (Backend).
2.  Ve a la sección **"Environment"**.
3.  Añade o actualiza la variable `FRONTEND_URL` con la URL de tu sitio en Netlify.
4.  Guarda los cambios. Render reiniciará el servicio automáticamente.

Esto es crucial para que la política **CORS** del backend permita las peticiones desde tu frontend.

---

## Notas Adicionales

*   **Archivo `netlify.toml`:** Se ha incluido un archivo `netlify.toml` en la carpeta `fronted` para manejar las redirecciones de la SPA (Single Page Application). Esto evita errores 404 al recargar páginas internas.
*   **Base de Datos:** Asegúrate de que tu base de datos en la nube permita conexiones desde las IPs de Render (o desde cualquier IP `0.0.0.0/0` si es seguro hacerlo).
*   **Estructura de Carpetas:**
    *   `backend/`: Código del servidor.
    *   `fronted/`: Código del cliente (React).

---

## Solución de Problemas Comunes

### 1. Error "Cannot find module" (Case Sensitivity)
Si ves errores como `Error: Cannot find module '../controllers/servicioController'`, es probable que el nombre del archivo en el código no coincida exactamente con el nombre del archivo en el sistema (mayúsculas/minúsculas).
*   **Solución:** Verifica que los `require` coincidan exactamente con el nombre del archivo. Ejemplo: `require('../controllers/ServicioController')` si el archivo es `ServicioController.js`.

### 2. Error de CORS
Si el frontend no puede conectarse al backend y ves errores de CORS en la consola del navegador o logs del servidor:
*   **Solución:** Asegúrate de haber añadido la variable de entorno `FRONTEND_URL` en Render con la URL exacta de tu sitio en Netlify (sin barra al final, ej. `https://mi-sitio.netlify.app`).
*   Revisa los logs de Render, hemos añadido mensajes para mostrar qué origen está siendo bloqueado.

### 3. Base de Datos
Si el backend inicia pero falla al conectar a la DB:
*   **Solución:** Verifica las credenciales en las variables de entorno de Render (`DB_HOST`, `DB_USER`, etc.). Asegúrate de que tu proveedor de base de datos permita conexiones externas.