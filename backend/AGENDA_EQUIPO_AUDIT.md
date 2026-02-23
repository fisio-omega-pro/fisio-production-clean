# Auditoría: Agenda por especialista y permisos (jefe vs fisios)

## Estado actual (antes de esta implementación)

### 1. Datos y separación por especialista

- **Citas (agenda):** Cada cita tiene `clinic_id` y opcionalmente `specialist_id` (id del documento en `clinicas/{id}/equipo`). Las citas están bien separadas por especialista a nivel de datos.
- **Equipo:** Se guarda en `clinicas/{id}/equipo` (subcolección). Cada documento es un especialista con `nombre`, `especialidad`, `isOwner`, etc.
- **Vista Agenda:** La UI permite filtrar por **TODOS** o por **un especialista**. Las columnas/horas se rellenan según `specialist_id`; `findApptForSlot` filtra por `selectedSpec`. La agenda está correctamente “optimizada” en el sentido de que cada cita se asocia a un especialista y la vista puede mostrar una columna por persona o solo una.

### 2. Quién ve qué (permisos)

- **Autenticación actual:** Un solo login por clínica (email + contraseña de la clínica). El JWT solo lleva `clinicId`. No existe “usuario = fisio María” vs “usuario = jefe”.
- **Backend:** `getDashboardData` devuelve **toda** la agenda de la clínica (`citas` donde `clinic_id === req.clinicId`) y todo el equipo. No hay filtro por “usuario actual”.
- **Conclusión:** Cualquiera que tenga el login de la clínica ve todas las agendas y puede elegir TODOS o cualquier especialista. **No** está implementado que “solo el fisio jefe ve todas las agendas y el resto solo la suya”.

### 3. Fisio jefe vs resto

- En **Equipo** hay un flag `isOwner` por especialista (quién es el jefe). Eso solo sirve para mostrar la corona en la UI; **no** se usa para permisos ni para filtrar datos según quien inicia sesión.
- No hay varios usuarios (cuentas) por clínica: no existe “cuenta del jefe” y “cuenta del fisio 2”. Por tanto, no se puede aplicar “solo el jefe ve todas, los fisios solo la suya” sin añadir lógica de multi-usuario.

---

## Objetivo deseado

- **Varios fisios:** Cada uno con su agenda bien definida y separada (por `specialist_id`).
- **Solo el fisio jefe** puede ver **todas** las agendas (TODOS + cada especialista).
- **Resto de fisios** solo pueden ver **su propia** agenda (no TODOS ni otros especialistas).

---

## Cambios implementados para soportar el objetivo

1. **Backend**
   - **Auth:** El JWT puede llevar opcionalmente `specialistId`. El middleware de auth deja en `req.specialistId` ese valor cuando existe.
   - **getDashboardData:**  
     - Si `req.specialistId` está definido (usuario “fisio”): se filtra la agenda a citas con `specialist_id === req.specialistId` y el equipo devuelto se limita a ese especialista (o se mantiene equipo completo según diseño). Se devuelve `currentUser: { specialistId, isOwner: false }`.  
     - Si no hay `specialistId` (jefe/owner): se devuelve toda la agenda y todo el equipo, y `currentUser: { specialistId: null, isOwner: true }`.
   - Así, cuando exista un login de “staff” que emita token con `specialistId`, ese usuario solo recibirá su agenda y el frontend podrá ocultar TODOS y otras agendas.

2. **Frontend**
   - El estado del dashboard incluye `currentUser` (viene de `data.currentUser`).
   - **AgendaView:** Si `currentUser.specialistId` existe, no se muestra la opción TODOS ni otros especialistas; se fija el filtro a ese especialista y solo se muestra su agenda.
   - **EquipoView:** Si `currentUser.specialistId` existe, se puede mostrar solo la ficha de ese especialista (y ocultar “Registrar especialista” / gestión de otros), de modo que cada fisio solo vea “su” contexto.

3. **Login de staff (implementado)**

   - **Colección `staff_logins`:** Document id = email normalizado (lowercase). Campos: `clinic_id`, `specialist_id`, `password` (hash, opcional). Si `password` está definido, el fisio entra con su propia contraseña; si no, con la de la clínica. Sirve para resolver “este email pertenece a este fisio de esta clínica”.
   - **Login:** Si el email no es el de la clínica, se busca en `staff_logins`. Si existe y tiene `password`, se verifica la contraseña contra ese hash; si no tiene, contra la contraseña de la clínica. Se devuelve JWT con `clinicId` y `specialistId`.
   - **Asignar email al fisio:** El jefe, en Equipo → Editar especialista, puede rellenar “Email de acceso (solo su agenda)”. Al guardar, se actualiza el doc del especialista con `login_email` y se crea/actualiza `staff_logins/{email}`. Si se borra el email, se elimina el doc de `staff_logins`.
   - **Recuperación de contraseña para staff:** En "Olvidé mi contraseña", si el email no es de una clínica se busca en `staff_logins`. Si existe, se crea token en `password_resets` con `type: 'staff'` y se envía el mismo email. Al restablecer se actualiza `staff_logins.{email}.password` (no la clínica).
   - **Contraseña propia:** El fisio puede configurar su contraseña con el enlace que recibe al asignarle el email, o usando "Recuperar contraseña" con su email. Si tiene contraseña en `staff_logins.password`, entra con ella; si no, con la de la clínica. Solo ve su agenda y su ficha en Equipo.

---

## Resumen

| Aspecto | Antes | Después (con specialistId en JWT) |
|--------|--------|-----------------------------------|
| Agendas separadas por especialista | Sí (datos y filtro UI) | Igual |
| Jefe ve todas las agendas | Sí (pero cualquiera con el mismo login también) | Sí; solo el token sin `specialistId` recibe toda la agenda. |
| Fisios solo ven su agenda | No | Sí; token con `specialistId` → backend filtra agenda y frontend oculta TODOS y otros. |
| Multi-usuario (varios logins por clínica) | No | Preparado; falta añadir login de staff que emita `specialistId`. |

La modificación deja la app lista para que, cuando se implemente el login de staff (o cualquier mecanismo que ponga `specialistId` en el token), el fisio jefe siga viendo todas las agendas y el resto solo la suya, de forma hermética y coherente con los datos.
