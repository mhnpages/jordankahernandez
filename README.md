# Jordanka · Sweet Sixteen

Invitación digital inmersiva y mobile-first para los Sweet Sixteen de Jordanka Hernández.

## Qué incluye

- Experiencia editorial animada y galería fotográfica.
- Información de misa, recepción, mapas y vestimenta.
- Cuenta regresiva al 18 de diciembre de 2026.
- Registro de asistencia almacenado en Cloudflare D1.
- Confirmación por WhatsApp al número `+1 (469) 865-6022`.
- Espacio preparado para agregar la canción elegida.
- Publicación automática desde GitHub hacia Cloudflare Workers.

## Recomendación de producción

La ruta recomendada es **GitHub + Cloudflare Workers + D1**. GitHub conserva el código y Cloudflare publica el sitio y guarda las confirmaciones. GitHub Pages por sí solo no es suficiente porque no ejecuta la API ni la base de datos del formulario.

## 1. Probar el sitio localmente

Requisitos: Node.js 22.13 o posterior y pnpm 11.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Abre la dirección local que aparezca en la terminal.

## 2. Subir el proyecto a GitHub

1. Crea un repositorio privado en GitHub.
2. Sube todo el contenido de esta carpeta a la rama `main`.
3. No subas archivos `.env`, claves ni tokens.

## 3. Crear la base de datos en Cloudflare

Inicia sesión en Cloudflare desde la terminal y crea la base de datos:

```bash
pnpm exec wrangler login
pnpm exec wrangler d1 create jordanka-rsvp
```

Cloudflare mostrará un `database_id`. Guárdalo para el siguiente paso.

## 4. Crear los secretos de GitHub

En el repositorio abre **Settings → Secrets and variables → Actions → New repository secret** y agrega:

| Secreto | Contenido |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Token de Cloudflare con permisos para Workers y D1 |
| `CLOUDFLARE_ACCOUNT_ID` | ID de la cuenta de Cloudflare |
| `CLOUDFLARE_D1_DATABASE_ID` | ID devuelto al crear `jordanka-rsvp` |

El token debe permitir editar Workers y D1 dentro de la cuenta seleccionada.

## 5. Publicar

Cada cambio enviado a la rama `main` activa el archivo `.github/workflows/deploy.yml`. El proceso:

1. instala las dependencias;
2. construye la invitación;
3. aplica las migraciones de la base de datos;
4. publica el Worker y los recursos visuales.

También puedes ejecutarlo manualmente desde la pestaña **Actions** de GitHub.

Al finalizar, Cloudflare mostrará una dirección `workers.dev`. Para usar un dominio propio, agrégalo en **Workers & Pages → jordanka-sweet-sixteen → Settings → Domains & Routes**.

## Publicación manual

Si prefieres publicar desde tu computadora:

```bash
export CLOUDFLARE_D1_DATABASE_ID="TU_DATABASE_ID"
export CLOUDFLARE_D1_DATABASE_NAME="jordanka-rsvp"
pnpm deploy
```

Wrangler utilizará la sesión iniciada con `wrangler login`.

## Cómo funciona la confirmación

El formulario primero guarda la respuesta en D1. Después abre WhatsApp con un mensaje preparado para `+1 (469) 865-6022`; el invitado únicamente debe tocar **Enviar**. El código internacional `1` está incluido, por lo que funciona desde Estados Unidos, Honduras u otro país.

## Agregar la canción

1. Guarda la canción autorizada como `public/song.mp3`.
2. En `app/page.tsx`, cambia:

```ts
const MUSIC_READY = false;
```

por:

```ts
const MUSIC_READY = true;
```

Los navegadores móviles pueden exigir la primera interacción del usuario antes de reproducir audio; la invitación utiliza la apertura del sello para intentarlo correctamente.

## Archivos principales

- `app/page.tsx`: contenido, interacción, formulario y WhatsApp.
- `app/globals.css`: diseño y experiencia responsive.
- `app/api/rsvp/route.ts`: API que guarda confirmaciones.
- `db/schema.ts`: estructura de la base de datos.
- `drizzle/`: migraciones de D1.
- `app/assets/`: fotografías incluidas en el proyecto.

## Privacidad

El paquete no contiene contraseñas, tokens ni credenciales de Cloudflare o GitHub. Mantén el repositorio privado mientras configuras y pruebas la invitación.
