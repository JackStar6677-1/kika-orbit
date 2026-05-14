# RoomKeeper

Calendario web privado para coordinar reservas, avisos y cambios de horario sin depender de un sitio vivo externo.

## Qué incluye

- Panel privado en `PHP` con calendario y control de acceso.
- Reservas con propietario, auditoría y solicitudes de cambio.
- Avisos por correo SMTP.
- Soporte para backend `JSON` y evolución a `MySQL` / `MariaDB`.
- Interfaz pensada para usarse como web, no como app instalada.

## Estructura principal

```text
RoomKeeper/
├─ admin/
│  ├─ auth.php
│  ├─ calendar.php
│  ├─ calendar_api.php
│  ├─ calendar_app.js
│  ├─ calendar_app_legacy.js
│  ├─ calendar_legacy.php
│  ├─ calendar_month_app.js
│  ├─ calendar_store.php
│  ├─ castel-theme.js
│  ├─ editor.php
│  ├─ mail_config.example.php
│  ├─ mailer.php
│  ├─ manifest.webmanifest
│  ├─ offline.html
│  ├─ pwa.js
│  ├─ security.php
│  ├─ sql.php
│  └─ sw.js
├─ data/
│  ├─ authorized_emails.example.json
│  ├─ calendar_backend.example.json
│  ├─ calendar_notices.example.json
│  ├─ calendar_store.example.json
│  └─ site.example.json
├─ docs/
│  ├─ diseno-calendario-multiusuario-y-bloqueos.md
│  └─ flujo-correos-calendario-privado.md
└─ .gitignore
```

## Archivos runtime locales

Estos archivos se usan al correr el panel, pero se dejan fuera de git:

- `admin/mail_config.php`
- `data/authorized_emails.json`
- `data/calendar_store.json`
- `data/calendar_backend.json`
- `data/calendar_notices.json`
- `data/admin_login_locks.json`
- `data/admin_tools.json`
- `data/site.json`

## Cómo partir en local

1. Copia `admin/mail_config.example.php` a `admin/mail_config.php`.
2. Copia `data/authorized_emails.example.json` a `data/authorized_emails.json`.
3. Copia `data/calendar_store.example.json` a `data/calendar_store.json`.
4. Crea los demás JSON runtime vacíos o con la configuración que necesites.
5. Abre el panel dentro de un entorno PHP.

## Nota sobre el seed de ejemplo

El `authorized_emails.example.json` incluye usuarios ficticios para arrancar rápido. La contraseña de ejemplo usada para esos seeds es `Cambio123!`.
