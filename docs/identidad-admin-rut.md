# Identidad de administradores por RUT

Kika Orbit puede usar RUT como identificador unico de administradores y directiva, pero no debe depender solo del RUT para iniciar sesion.

## Enfoque recomendado

- RUT: identificador legal/unico para evitar duplicados.
- Correo: canal de contacto y recuperacion.
- Password propia de Kika Orbit o login Google: metodo de acceso.
- Rol: define que puede hacer cada persona.
- Auditoria: todo cambio importante debe registrar actor, fecha y accion.

## Regla de seguridad

El RUT completo es dato personal sensible. No se debe commitear en el repo publico.

Para desarrollo local se usa:

```text
.local/admin_roster.json
```

Para documentar estructura se usa:

```text
data/admin_roster.example.json
```

## Estados sugeridos

- `active`: puede entrar y operar.
- `needs_rut_confirmation`: el RUT no valida o falta confirmacion.
- `invited`: existe en la directiva pero aun no configuro acceso.
- `disabled`: ya no debe entrar.

## Restablecimiento de contrasenia

Si usamos password propia:

1. La persona ingresa RUT.
2. El sistema busca el RUT normalizado o su hash.
3. Si existe y esta activo, envia un link/codigo al correo asociado.
4. El token se guarda hasheado y vence rapido.
5. La persona crea nueva clave.
6. Se invalida el token y se registra auditoria.

No conviene mostrar si un RUT existe o no. El mensaje publico debe ser neutral:

```text
Si los datos existen y estan activos, enviaremos instrucciones al correo asociado.
```

## Google

Si usamos login Google, el RUT sigue sirviendo como identificador interno y control de roles. El correo Google conectado debe coincidir con el correo asociado al RUT o quedar aprobado manualmente por un admin.
