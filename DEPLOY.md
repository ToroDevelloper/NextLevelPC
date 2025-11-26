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

---

## Configuración de Stripe en Producción

Para que los pagos funcionen correctamente en el entorno desplegado (sin depender del CLI de Stripe), debes configurar los Webhooks directamente en el Dashboard de Stripe.

### 1. Obtener Claves de API
1.  Ve al [Dashboard de Stripe](https://dashboard.stripe.com/apikeys).
2.  Asegúrate de estar en modo **Test** (o **Live** si vas a producción real).
3.  Copia la **Secret key** (`sk_test_...` o `sk_live_...`).
4.  Ve a **Render** -> Tu servicio Backend -> **Environment**.
5.  Asegúrate de que la variable `STRIPE_SECRET_KEY` tenga este valor.

### 2. Configurar Webhook en Stripe
A diferencia del desarrollo local donde usas `stripe listen`, en producción Stripe debe enviar los eventos a tu URL pública de Render.

1.  Ve a [Stripe Dashboard - Webhooks](https://dashboard.stripe.com/webhooks).
2.  Haz clic en **"Añadir un destino"** (o "Add endpoint").
3.  **Elegir tipo de destino:** Selecciona **"Webhook Endpoint"** (o simplemente continúa si ya estás en la configuración).
4.  **Elegir primero los eventos que se notificarán:**
    *   En la lista de eventos, busca y selecciona **Payment Intent**.
    *   Dentro de Payment Intent, marca las casillas para:
        *   `payment_intent.succeeded`
        *   `payment_intent.payment_failed`
        *   `payment_intent.canceled`
    *   Haz clic en **"Continuar"**.
5.  **Configurar tu destino:**
    *   **Endpoint URL:** Ingresa la URL de tu backend en Render seguida de la ruta del webhook.
        *   Ejemplo: `https://nextlevelpc-backend.onrender.com/api/payments/webhook`
    *   Asegúrate de que la URL sea correcta y termine en `/api/payments/webhook`.
6.  Haz clic en **"Añadir endpoint"** o **"Crear destino"**.

### 3. Obtener el Secreto del Webhook (Signing Secret)
Una vez creado el endpoint en el paso anterior:

1.  En la pantalla de detalles del Webhook que acabas de crear, busca la sección **"Signing secret"**.
2.  Haz clic en **"Reveal"** para ver el secreto que empieza por `whsec_...`.
3.  Copia este valor.

### 4. Configurar Variable en Render
1.  Ve nuevamente a **Render** -> Tu servicio Backend -> **Environment**.
2.  Añade o actualiza la variable `STRIPE_WEBHOOK_SECRET`.
3.  Pega el valor `whsec_...` que copiaste en el paso anterior.
4.  Guarda los cambios. Render reiniciará el servicio.

¡Listo! Ahora Stripe enviará notificaciones de pago directamente a tu servidor en Render, permitiendo que las órdenes se actualicen automáticamente sin necesidad de intervención manual.

### 4. Errores en el Frontend (Stripe)
Si ves errores en la consola como `ERR_BLOCKED_BY_CLIENT` relacionados con `stripe.com` o el pago se queda "Esperando sesión de pago":
*   **Causa:** Es muy probable que una extensión del navegador (AdBlock, uBlock Origin, Privacy Badger, etc.) esté bloqueando los scripts de Stripe necesarios para procesar el pago.
*   **Solución:** Desactiva temporalmente las extensiones de bloqueo de anuncios para tu sitio web y recarga la página.

### 5. Errores de Autenticación (401 Unauthorized)
Si recibes errores 401 al intentar pagar o acceder a rutas protegidas, a pesar de haber iniciado sesión:
*   **Causa:** Las cookies de sesión pueden estar siendo bloqueadas por el navegador debido a políticas de seguridad Cross-Site (Frontend en Netlify y Backend en Render son dominios diferentes).
*   **Solución:** Hemos configurado las cookies con `SameSite: None` y `Secure: true` para producción. Asegúrate de que tu backend en Render tenga la variable `NODE_ENV` establecida en `production`.

### 6. Cookies y HTTPS
Si las cookies de sesión no se guardan o recibes errores 401:
*   **Importante:** En producción, las cookies están configuradas como `Secure`. Esto significa que **SOLO se enviarán a través de conexiones HTTPS**.
*   Si intentas conectar tu frontend en `localhost` (HTTP) con el backend en Render (HTTPS), las cookies **NO funcionarán** y no podrás iniciar sesión ni pagar.
*   **Solución:** Realiza las pruebas finales desde el frontend desplegado en Netlify (que usa HTTPS).