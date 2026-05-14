# Prompt de continuidad para Kika Orbit

Usa este mensaje para poner en contexto a otra IA/Codex en el desktop y continuar el proyecto sin perder el hilo.

---

Actua como Codex trabajando en mi laptop Windows con PowerShell. Quiero que continues el proyecto **Kika Orbit**, que nace desde un texto de requerimientos de Kika y desde el calendario base de Castel.

## Estilo de trabajo que quiero

- Hablame en espanol, directo y colaborativo.
- No te quedes solo en explicar: si puedes avanzar, avanza.
- Antes de tocar archivos del proyecto, haz un respaldo.
- Si el proyecto esta conectado a GitHub, despues de cambios relevantes haz commit y push.
- No publiques secretos, tokens, `.env`, credenciales OAuth ni archivos locales privados.
- Usa codigo ordenado, mantenible, con comentarios solo donde aporten.
- Evita que el codigo parezca generado sin criterio. Prefiero decisiones simples, limpias y faciles de mantener.
- Si hay una decision de infraestructura con riesgo, explicame la consecuencia antes de dejar algo irreversible.

## Rutas importantes

Texto original de Kika:

```text
C:\Users\Jack\Downloads\Proyecto para kika.txt
```

Repo/local actual del proyecto:

```text
C:\Users\Jack\Documents\GitHub\Experimentos\Castel\CastelRoomKeeper
```

Aunque la carpeta todavia se llama `CastelRoomKeeper`, el repo publico nuevo es:

```text
https://github.com/JackStar6677-1/kika-orbit
```

Remoto principal para este proyecto:

```text
kika-orbit -> https://github.com/JackStar6677-1/kika-orbit.git
```

Tambien puede existir el remoto viejo:

```text
origin -> https://github.com/JackStar6677-1/CastelRoomKeeper.git
```

No empujes cambios a `origin` salvo que yo lo pida. Para Kika Orbit usa `kika-orbit`.

## Contexto general del proyecto

Kika Orbit es una plataforma web tipo SaaS/PWA para centros de estudiantes o coordinacion universitaria.

La idea central es convertir un calendario academico y administrativo en una herramienta viva para:

- crear y administrar eventos
- coordinar calendarios institucionales
- manejar roles de administradores
- validar administradores por RUT unico
- sincronizar eventos con Google Calendar
- considerar feriados chilenos, incluyendo irrenunciables
- permitir una futura identidad de marca distinta si Kika cambia nombre o si se vende/adapta a una universidad

El nombre de trabajo es **Kika Orbit**, porque Jack usa nombres mas "galacticos" en sus proyectos. El nombre debe ser facil de cambiar despues mediante configuracion de branding.

## Decisiones tecnicas tomadas

Stack actual:

- Backend: Python + FastAPI
- Base de datos local inicial: SQLite
- Base de datos objetivo: PostgreSQL
- Frontend actual: HTML/CSS/JS servido desde FastAPI
- Formato objetivo: web/PWA, no app nativa por ahora
- Integracion principal: Google Calendar API con OAuth 2.0
- Gmail queda como opcion posterior, no como dependencia inicial

Por ahora NO se eligio Ionic ni app movil nativa. La decision fue partir como web/PWA porque:

- es mas rapido para desarrollar
- funciona en desktop y celular
- se puede instalar como PWA despues
- evita complejidad de publicar en tiendas
- permite venderlo como SaaS mas facilmente

## Estado actual del codigo

Ya existe una base FastAPI funcional con:

- `pyproject.toml`
- `.env.example`
- `.gitignore`
- paquete backend `backend/kika_orbit`
- modelos SQLAlchemy
- endpoints API
- frontend estatico
- PWA basica
- feriados chilenos
- base de identidad por RUT
- inicio de integracion Google OAuth

Endpoints conocidos:

```text
/api/health
/api/organizations
/api/centers
/api/events
/api/holidays
/api/integrations/google/status
/api/integrations/google/login
/api/integrations/google/callback
```

Rutas web conocidas:

```text
/
/login
/app
/manifest.webmanifest
/sw.js
/offline
```

Archivos importantes:

```text
backend/kika_orbit/main.py
backend/kika_orbit/settings.py
backend/kika_orbit/models.py
backend/kika_orbit/api/integrations.py
backend/kika_orbit/integrations/google_oauth.py
backend/kika_orbit/domain/holidays.py
backend/kika_orbit/domain/rut.py
backend/kika_orbit/domain/admin_roster.py
backend/kika_orbit/web/static/index.html
backend/kika_orbit/web/static/styles.css
backend/kika_orbit/web/static/app.js
backend/kika_orbit/web/static/manifest.webmanifest
backend/kika_orbit/web/static/sw.js
docs/estrategia-google-sin-dominio.md
docs/identidad-admin-rut.md
docs/brand/kika-orbit-oauth-logo.svg
docs/brand/kika-orbit-oauth-logo-512.png
```

## Comandos locales utiles

Desde el repo:

```powershell
Set-Location -LiteralPath 'C:\Users\Jack\Documents\GitHub\Experimentos\Castel\CastelRoomKeeper'
uv sync
uv run ruff check .
uv run pytest
uv run uvicorn kika_orbit.main:app --app-dir backend --host 127.0.0.1 --port 8000
```

Probar app local:

```text
http://127.0.0.1:8000
```

Revisar salud:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/health
```

## Google OAuth y Calendar

Se decidio mantener Google Calendar como pieza central. No se debe abandonar Google salvo nueva instruccion.

Motivo:

- Kika necesita manejar calendario real.
- No usan necesariamente correo institucional.
- Kika usa Gmail personal.
- Queremos permitir conectar una cuenta Google real para administrar eventos.

Google Cloud ya tiene un proyecto relacionado con Kika Orbit.

Client ID conocido:

```text
368948244630-m9vqvg9vv0qik94fqbonaq91taq3u4kr.apps.googleusercontent.com
```

Existe un JSON OAuth descargado por Jack en:

```text
C:\Users\Jack\Downloads\client_secret_368948244630-m9vqvg9vv0qik94fqbonaq91taq3u4kr.apps.googleusercontent.com.json
```

Ese archivo contiene secretos. No imprimirlo, no subirlo a GitHub.

En el proyecto se debe guardar solo localmente en:

```text
.local/google_oauth_client_secret.json
```

Y `.env` local debe tener los valores reales. `.env` esta ignorado por Git.

Variables esperadas en `.env.example`:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CLIENT_SECRET_FILE=.local/google_oauth_client_secret.json
GOOGLE_REDIRECT_URI=http://localhost:8000/api/integrations/google/callback
GOOGLE_CALENDAR_SCOPES=https://www.googleapis.com/auth/calendar.events
GOOGLE_GMAIL_SCOPES=https://www.googleapis.com/auth/gmail.send
GOOGLE_OAUTH_STATE_PATH=.local/google_oauth_state.json
GOOGLE_TOKEN_PATH=.local/google_token.json
```

Estado del OAuth:

- Para desarrollo local usa:

```text
http://localhost:8000/api/integrations/google/callback
```

- Para probar con dominio publico se quiere usar:

```text
https://kika.drakescraft.cl/api/integrations/google/callback
```

Ese redirect URI debe agregarse en Google Cloud en el cliente OAuth.

Tambien agregar como JavaScript origin:

```text
https://kika.drakescraft.cl
```

Importante:

- Google OAuth puede mostrar bloqueo si la app esta en "Testing" y el correo no esta como test user.
- Si se quiere publico real con scopes sensibles, puede requerir verificacion de Google.
- No se quiere depender de Google Workspace ni correo institucional.
- Por ahora evitar Gmail si no es estrictamente necesario. Calendar primero.
- Si se puede, evaluar scope mas acotado para Calendar, por ejemplo `calendar.events.owned`, pero confirmar compatibilidad con lo que necesita Kika.

## Identidad y administradores por RUT

Se decidio validar administradores por RUT unico, porque no todos tendran correo institucional.

Enfoque:

- RUT como identidad fuerte local.
- Email asociado para contacto, recuperacion o Google OAuth.
- No guardar RUT en claro si no es necesario.
- Guardar hash del RUT y version enmascarada.
- Usar pepper local en `.env`, no subirlo a Git.

Jack entrego algunos RUT/correos reales durante el trabajo. No los incluyas en archivos versionados porque este repo es publico. Si necesitas esos datos, revisa solo el archivo local ignorado por Git.

Hay un archivo local ignorado:

```text
.local/admin_roster.json
```

Y un ejemplo versionado:

```text
data/admin_roster.example.json
```

Nota: uno de los RUT reales cargados localmente fue marcado como posible `needs_rut_confirmation` porque el validador puede considerarlo invalido. Pedir confirmacion antes de activarlo.

## Feriados chilenos

Se adopto logica del calendario de Castel para feriados chilenos.

Ya existe:

```text
backend/kika_orbit/domain/holidays.py
backend/kika_orbit/api/holidays.py
```

Debe conservarse:

- feriados nacionales
- feriados irrenunciables
- visualizacion en calendario/agenda

Endpoint:

```text
/api/holidays?year=2026
```

## UI/PWA

La UI actual ya tiene una base visual:

- colores naranjos, morados y dorados
- animaciones
- vista login
- vista calendario/dashboard
- agenda
- tarjetas metricas
- panel de Google Calendar
- boton de conectar Google
- PWA shell
- manifest
- service worker
- offline page
- icono/logo OAuth

Jack pidio que se vea con identidad, no generico ni "AI slop".

Mantener direccion visual:

- galactica/orbital
- naranja/morado/dorado
- moderna, pero util
- animaciones con intencion
- sonidos suaves opcionales

## Cloudflare, dominio y hosting

Dominio disponible:

```text
drakescraft.cl
```

Jack ya lo usa con Cloudflare para una web desde GitHub y para Minecraft:

```text
drakescraft.cl
play.drakescraft.cl
```

No romper esos DNS.

Subdominio pensado para Kika Orbit:

```text
kika.drakescraft.cl
```

Durante desarrollo se puede usar:

```text
https://kika.drakescraft.cl -> http://localhost:8000
```

Eso se haria con Cloudflare Tunnel. Sirve para mostrar avances y probar OAuth con URL publica, pero depende de que la laptop este encendida y corriendo:

- FastAPI local
- cloudflared tunnel

Comandos conceptuales para Cloudflare Tunnel:

```powershell
cloudflared tunnel login
cloudflared tunnel create kika-orbit
cloudflared tunnel route dns kika-orbit kika.drakescraft.cl
cloudflared tunnel run kika-orbit
```

No pedir contrasena Cloudflare. Jack debe iniciar sesion en el navegador/terminal.

## VPS / servidor

Jack esta evaluando comprar/arrendar una maquina barata para alojar Kika Orbit mientras se desarrolla.

Lo que quiere NO es hosting Minecraft limitado, sino:

- VPS real
- Linux con root/SSH
- Docker
- Postgres
- Nginx/Caddy
- logs
- backups
- libertad para correr varios proyectos

Se compararon opciones:

### Hostinger VPS

Buen candidato:

```text
KVM 2
2 vCPU
8 GB RAM
100 GB NVMe
8 TB ancho de banda
```

Ventajas:

- buen equilibrio RAM/precio
- root/SSH
- panel simple

Ojo:

- precio promocional requiere pago largo
- renovacion sube
- revisar politica de reembolso

### HostGator Chile VPS

Planes vistos:

```text
VPS NVMe 2
1 vCPU
2 GB RAM
50 GB NVMe

VPS NVMe 4
2 vCPU
4 GB RAM
100 GB NVMe

VPS NVMe 8
4 vCPU
8 GB RAM
200 GB NVMe
```

Opinion:

- `VPS NVMe 2` es demasiado justo.
- `VPS NVMe 4` sirve como minimo razonable para Kika Orbit.
- `VPS NVMe 8` es la mejor opcion si Jack quiere una "nave nodriza" para varios proyectos.

Recomendacion final discutida:

```text
Si solo Kika Orbit: VPS NVMe 4.
Si tambien laboratorio personal, n8n, bots, otros proyectos: VPS NVMe 8.
```

No instalar cPanel para este proyecto. Preferir Ubuntu limpio + Docker.

Servidor recomendado:

```text
Ubuntu 24.04 LTS
Docker + Docker Compose
Caddy para HTTPS
PostgreSQL
Backups diarios
```

Arquitectura objetivo en VPS:

```text
kika.drakescraft.cl
  -> Cloudflare DNS/SSL
  -> VPS Linux
  -> Caddy reverse proxy
  -> Kika Orbit FastAPI
  -> PostgreSQL
```

## Tareas pendientes inmediatas

1. Leer nuevamente el texto original de Kika:

```text
C:\Users\Jack\Downloads\Proyecto para kika.txt
```

2. Revisar README y docs actuales para no duplicar decisiones.

3. Ejecutar validaciones:

```powershell
uv run ruff check .
uv run pytest
```

4. Probar app local en:

```text
http://127.0.0.1:8000
```

5. Completar base de autenticacion:

- login real por RUT + password
- recuperacion de password por email
- invitacion/activacion de admins
- hash de password
- auditoria de accesos

6. Completar integracion Google Calendar:

- conectar cuenta Google
- listar estado de conexion
- crear evento de prueba
- sincronizar eventos propios
- manejar refresh token
- manejar desconexion
- no exponer tokens

7. Definir modelo de datos final:

- organizacion
- centro de estudiantes
- usuarios/admins
- roles
- espacios/salas
- eventos
- bloqueos/reservas
- feriados
- auditoria
- integraciones

8. Mejorar UI:

- calendario mensual mas real
- modal crear/editar evento
- filtros por centro/espacio/tipo
- gestion de administradores
- gestion de espacios
- estados de sincronizacion Google
- responsive movil

9. Preparar despliegue:

- Dockerfile
- docker-compose
- Caddyfile
- variables `.env.production.example`
- migraciones DB
- script de backup
- docs de servidor

10. Si Jack compra VPS:

- pedir IP publica
- configurar SSH key
- crear usuario deploy
- instalar Docker
- configurar firewall
- desplegar app
- apuntar `kika.drakescraft.cl`
- actualizar Google OAuth redirect URI

## Comportamiento esperado cuando continues

Primero:

```powershell
Set-Location -LiteralPath 'C:\Users\Jack\Documents\GitHub\Experimentos\Castel\CastelRoomKeeper'
git status --short --branch
```

Luego haz respaldo:

```powershell
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$src = 'C:\Users\Jack\Documents\GitHub\Experimentos\Castel\CastelRoomKeeper'
$dst = "C:\Users\Jack\Documents\Backups\KikaOrbit_desktop_$timestamp"
New-Item -ItemType Directory -Force -Path $dst | Out-Null
robocopy $src $dst /E /XD .git .venv .local .pytest_cache .ruff_cache __pycache__ /XF .env *.pyc
```

Despues:

- lee `README.md`
- lee los docs en `docs`
- lee el txt de Kika
- revisa el codigo actual
- continua con el siguiente bloque logico
- corre tests
- commit y push a `kika-orbit/main`

## Advertencias de seguridad

No subir:

```text
.env
.local/
client_secret_*.json
google_token.json
admin_roster.json real
tokens Cloudflare
credenciales del VPS
```

Si necesitas mostrar configuracion, usa ejemplos sin secretos.

## Ultimo objetivo practico

Dejar Kika Orbit avanzando hacia una PWA/SaaS real, conectada a Google Calendar, con administradores por RUT, feriados chilenos, UI pulida y lista para desplegar en `kika.drakescraft.cl`, ya sea con Cloudflare Tunnel mientras se desarrolla o con un VPS Ubuntu cuando Jack lo compre.
