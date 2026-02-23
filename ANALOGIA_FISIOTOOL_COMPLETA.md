# Analogía completa: FisioTool como Central de Mando de Élite

Este documento describe **todas** las funcionalidades de FisioTool usando una analogía coherente: una **Central de Mando de Élite** con una **Directora de Operaciones IA** (Ana), un **Asesor Legal/CFO** (Lex) y un **Centro de Inteligencia** (Foundry). No se omite ninguna pieza del producto.

---

## 1. Puertas de entrada (públicas)

### 1.1 Landing principal (fisiotool.com)
- **Analogía:** El vestíbulo de la central. Página de aterrizaje con hero, features, ROI, testimonios, FAQ, pricing y CTA.
- **Funcionalidad:** Informar, convencer y dirigir a registro o login.
- **Componentes:** Hero, Features (cobros/fianzas, agenda, PWA pacientes, etc.), RoiSection (no-shows, fianzas), TestimonialsGallery, FaqSection, Pricing.

### 1.2 Formulario de lead corporativo
- **Analogía:** Libro de visitas para empresas o clínicas que quieren información comercial.
- **Funcionalidad:** `POST /api/public/corporate-lead` — captura datos (nombre, email, empresa, mensaje) sin crear cuenta.
- **Dónde:** Modal o sección en Pricing / landing; botón “Acceso clientes” lleva a login.

### 1.3 Login
- **Analogía:** Control de acceso con credenciales.
- **Funcionalidad:** `POST /api/login` (email + password). Token JWT en `localStorage` (`fisio_token`). Redirección a `/dashboard` o `/login` si falla.

### 1.4 Recuperar contraseña
- **Analogía:** Emisión de pase temporal por email.
- **Funcionalidad:** `POST /api/auth/forgot-password` → envía enlace; `POST /api/auth/reset-password` con token en query. Páginas: `/recuperar-contraseña`, `/reset-password`.

### 1.5 Registro (onboarding) — Setup
- **Analogía:** Ceremonia de alta en la central: datos de la clínica, horarios, precios, legal y referidos.
- **Ruta:** `/setup` (también `/setup?ref=CODIGO` para referidos).
- **Funcionalidad:** Formulario multi-paso que llama a `POST /api/register` con:
  - Datos básicos: nombre clínica, email, password, aceptación legal.
  - Dirección: calle, número, ciudad, CP, provincia.
  - Horario: apertura, cierre, descanso (inicio/fin).
  - Especializaciones (red flags): Accidentes Tráfico, Suelo Pélvico, Pediatría, Oncológico, Cía. Seguros, Infeccioso/Fiebre, Post-Cirugía.
  - Facturación: precio sesión, fianza, métodos de pago (Stripe, Bizum, Efectivo), acepta bonos, precio bono 5 sesiones.
  - Parámetros URL: `ref` / `referral` / `codigo` / `code` (referido), `plan`, `tz`/`timezone`, `is_blind`/`blind`/`access=1` (modo invidente).
- **Accesibilidad:** Si `is_blind` está activo, narración por pasos (speech synthesis) y textos adaptados.

### 1.6 Página de acceso (experiencia auditiva)
- **Analogía:** Tour guiado por voz para profesionales invidentes.
- **Ruta:** `/access`.
- **Funcionalidad:** Landing auditiva con Ana y Lex: scripts por secciones (hero, features, roi, legal, accessibility, pricing, faq, cta). Reproducción por voz (TTS), pausa/reanudar, navegación entre bloques.

---

## 2. Dashboard (Central de Mando)

Tras login, el usuario entra al dashboard. Si falta **licencia** o **Stripe**, se muestra **SetupLockView** (modo limitado) con mensaje para completar logo, suscripción y banco.

### 2.1 Configuración inicial (Setup Wizard)
- **Analogía:** Tres candados que hay que abrir para operar a pleno.
- **Pasos:**  
  1. **Identidad visual:** Subir logo propio o usar logo genérico (`uploadLogo`, `useDefaultLogo`).  
  2. **Licencia FisioTool:** Suscripción Pro (50€/mes) vía `upgradePlan` → redirección a Stripe Checkout.  
  3. **Tu banco:** Conectar Stripe Express (`connectStripe`) para cobros.
- **Modo invidente:** Narración breve de los tres pasos al entrar al wizard.

### 2.2 Navegación del dashboard
- **Principal:** Inicio, Agenda, Pacientes, Mis Clínicas.
- **Gestión:** Balance, Bonos de Sesiones, Equipo.
- **Inteligencia:** Consultoría Ana, Lex Legal.
- **Configuración:** Pagos, Referidos, Ajustes, Sugerencias, Instalar App (PWA).

---

## 3. Módulos del dashboard (detalle)

### 3.1 Inicio (HomeView)
- **Analogía:** Panel de estado y acceso rápido al Portal del Paciente.
- **Funcionalidad:**
  - Enlace público de reservas: `{origin}/setup?ref={clinicId}` (para compartir con pacientes).
  - Script listo para WhatsApp (mensaje de Ana con enlace) y botón “Copiar mensaje para WhatsApp”.
  - Botón “Probar Portal” (abre el enlace en nueva pestaña).
- **Mensaje:** “Centro de Mando Activo” y “Portal del Paciente” para automatizar agenda.

### 3.2 Agenda (AgendaView)
- **Analogía:** Tablero de misiones con semáforo financiero.
- **Funcionalidad:**
  - Vista por **día** o **mes**; filtro por especialista (o “Agenda Principal”).
  - Horas generadas según configuración de clínica (apertura/cierre).
  - Citas con estado: **pagado** (verde), **pendiente** (naranja), resto (default).
  - En vista mes: puntos por día (hay pagados / pendientes).
  - Acciones: bloquear horario (BlockModal), nueva cita (AppointmentModal), clic en evento (editar/ver).
- **Datos:** `agenda` (citas), `equipo` (especialistas), `horario` (apertura, cierre).

### 3.3 Pacientes (PacientesView)
- **Analogía:** Expedientes centralizados con memoria infalible.
- **Funcionalidad:**
  - Listado con búsqueda (nombre, teléfono) y filtro Todos / Activos.
  - Columnas: identidad/diagnóstico, contacto, estatus.
  - **Importar datos:** ImportModal (CSV/Excel) → `POST /api/dashboard/import-pacientes`.
  - **Grabar informe clínico:** VoiceModal — notas de voz que se envían al backend y se asocian al paciente (dictado por voz, procesado por IA).
  - Historial por paciente (HistoryModal) con notas e historial de citas.

### 3.4 Mis Clínicas (SedesView)
- **Analogía:** Mapa de sedes de la red.
- **Funcionalidad:** Listar sedes de la clínica, añadir nueva sede (modal), editar. Datos de cada sede (nombre, dirección, horarios si aplica). APIs: datos del dashboard incluyen sedes; alta/edición vía endpoints de dashboard.

### 3.5 Balance (FinanzasView)
- **Analogía:** Cuadro de mandos financiero con botón de “ignición” de campaña.
- **Funcionalidad:**
  - Tarjetas: Balance real, Proyección mes, Eficiencia IA (ROI).
  - **Desplegar campaña de recaptación:** Un clic activa la campaña de Ana: contacto a pacientes sin cita reciente (ej. 30 días), oferta de bonos, emails automatizados. Estado “Ana en modo prospección” cuando `modo_caza_activo` está activo.
  - Backend: segmentación, envío de emails, rate limit y persistencia (recaptación real).

### 3.6 Bonos de Sesiones (BonosView)
- **Analogía:** Monedero virtual de sesiones prepagadas.
- **Funcionalidad:**
  - Si el módulo no está activado (`acepta_bonos`): pantalla de activación (Activar módulo de bonos) → llama a `onActivate` (API correspondiente).
  - Si está activado: listado de bonos (paciente, sesiones restantes/totales), botón “Emitir nuevo bono” (modal de creación). APIs: activación, listado bonos, creación.

### 3.7 Equipo (EquipoView)
- **Analogía:** Panel de control de personal.
- **Funcionalidad:** Gestión de especialistas por sede: listar, añadir, editar (EditProfileModal), asignar a sedes. Guardado vía `save-cobros` o endpoints específicos de equipo/sedes.

### 3.8 Consultoría Ana (AsistenteView)
- **Analogía:** Sala de consultas con la Directora de Operaciones.
- **Funcionalidad:** Chat con agente `ana`. `POST /api/chat/dashboard` con `agent: 'ana'`. Ana responde dudas operativas, de uso del dashboard y diagnóstico. UI: mensajes Ana (izq) / usuario (der), input y “ANA PENSANDO...” durante carga.

### 3.9 Lex Legal (LegalView)
- **Analogía:** Sala de juntas con el asesor legal y CFO.
- **Funcionalidad:**
  - Chat con agente `lex`. `POST /api/chat/dashboard` con `agent: 'lex'`.
  - **Sidebar dinámico** con estado legal real (`getLegalStatus`):
    - RGPD/Términos: aceptados o pendientes.
    - Contratos archivados: contador.
    - Obligaciones (array): nivel ok/warn/info, título y hint (ej. logo pendiente, Stripe pendiente, suscripción).
  - Lex responde sobre LLC, impuestos, RGPD, seguridad legal.

### 3.10 Pagos (CobrosView)
- **Analogía:** Bóveda de cobros y métodos de pago.
- **Funcionalidad:**
  - **Stripe Express:** Conectar cuenta (connectStripe → redirección OAuth). Si ya conectado: “Conexión Activa”. Ana “verifica la transacción al instante”; fianzas y cobros van al banco del clínico.
  - **Bizum:** Campo de teléfono para Bizum, guardar con `POST /api/dashboard/save-cobros` (bizumNumber). Cobro manual: paciente envía, clínico confirma.
  - Mensaje de error si Stripe no está configurado en entorno (ej. clave sk_).

### 3.11 Referidos (ReferidosView)
- **Analogía:** Programa de alianzas y reclutamiento.
- **Funcionalidad:**
  - Código de referido por clínica (`getReferrals`).
  - Enlace de invitación: `https://www.fisiotool.com/setup?ref={code}`.
  - Copiar código o enlace. Listado de referidos (cuántos se han registrado con ese código). Créditos acumulables (según backend).
  - Registro con `ref` en setup vincula la nueva clínica al referidor.

### 3.12 Ajustes (AjustesView)
- **Analogía:** Consola de personalización de la clínica.
- **Funcionalidad:**
  - Perfil: nombre de clínica, email de acceso. Guardar con `updateSettings`.
  - Seguridad: enlace a “Recuperar contraseña” (recuperar-contraseña con email pre-rellenado).

### 3.13 Sugerencias (SugerenciasView / SuggestionsView)
- **Analogía:** Buzón de ideas y feedback.
- **Funcionalidad:** Enviar sugerencias al equipo (formulario o integración con backend/Foundry). En Foundry (modo Dios) hay `pendingSuggestions` y gestión de sugerencias.

### 3.14 Instalar App (InstalacionView — PWA)
- **Analogía:** Convertir la central en app de bolsillo.
- **Funcionalidad:**
  - Uso de `beforeinstallprompt` (deferredPrompt) para mostrar botón “Instalar ahora”.
  - Si no hay prompt: instrucciones (menú del navegador → “Instalar aplicación” / “Añadir a pantalla de inicio”).
  - PWA: manifest (`/manifest.json`), theme color, service worker (`/service-worker.js`) registrado en layout. App instalable, inicio en `/dashboard`, modo standalone.

---

## 4. Backend (Sala de máquinas)

- **Infraestructura:** Google Cloud Run (escalable). Variables y secretos sensibles en Google Secret Manager.
- **Rutas principales (resumen):**
  - Auth: `POST /api/login`, `POST /api/register`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`.
  - Público: `POST /api/public/corporate-lead`.
  - Stripe: webhooks (suscripciones, pagos).
  - Admin (Foundry): `x-foundry-key` en cabecera: stats-globales, import-leads, campaign (activar/desactivar), leads status, send-prospect-email, run-deposit-reminders, etc.
  - Dashboard (JWT): datos dashboard, historial pacientes, referidos, estado legal, save-cobros, citas, notas, sugerencias, sedes, equipo, import-pacientes, bonos (activar/crear), campaña recaptación, connect-Stripe, upgradePlan, verify-payment, etc.
  - Chat: `POST /api/chat/dashboard` (agent: ana | lex).

---

## 5. Fianzas y recordatorios (blindaje económico)

- **Concepto:** Fianza configurable (ej. 15€) por reserva para reducir no-shows. El paciente paga la fianza para confirmar; si no asiste, la clínica no pierde el hueco.
- **Flujo:** Al registrar reserva se calcula ventana de pago y **recordatorio 1 h antes** de expiración.
- **Servicio:** `depositReminderService`: consulta citas con `deposit_reminder_sent === false` y `reminder_el <= now`; envía email recordatorio (“Te queda aproximadamente 1 hora para completar el pago de la fianza…”); marca `deposit_reminder_sent`, maneja errores (sin email, expirada).
- **Automatización:** Cloud Scheduler ejecuta `POST /api/admin/run-deposit-reminders` cada 10 min en ventana 08:00–20:00 (configurable en `setup-cloud-scheduler.sh`).
- **Configuración:** Fianza y precios en setup y en configuración de clínica (config_ia).

---

## 6. Foundry (Centro de Inteligencia y Prospección)

Acceso con clave `x-foundry-key` (Foundry). Tres modos:

### 6.1 Modo Dios
- **Analogía:** Vista de director general.
- **Funcionalidad:** Estadísticas globales (MRR, total clínicas, beneficio neto, gastos, leads, en proceso, interesados, convertidos, sugerencias pendientes). Búsqueda, paginación, filtros (mes, tipo). Auditoría de contratos, gestión de alertas. Listado de clínicas, facturas, contratos, sugerencias.

### 6.2 Modo Caza
- **Analogía:** Centro de prospección automatizada.
- **Funcionalidad:**
  - Importar leads por CSV (videntes / invidentes) → `POST /api/admin/import-leads` (leadType).
  - Activar/desactivar campaña de emails (`POST /api/admin/campaign`). Backend: cadencia, rate limit, respeto a `campaignActive`, detección de rebotes.
  - Listado de leads; cambiar estado (ej. interesado, convertido) → `POST /api/admin/leads/:id/status`.
  - Enviar email manual a un lead → `POST /api/admin/send-prospect-email` (preview en UI).
  - Pruebas A/B/C de emails (según backend). Persistencia de última acción por lead.

### 6.3 Modo LLC
- **Analogía:** Sala de juntas legal y financiera.
- **Funcionalidad:**
  - Chat con Lex (historial en UI).
  - Crear alertas (título, fecha, tipo fiscal).
  - Subir facturas y procesarlas.
  - Subir contratos; listado y selector; vista de texto de contrato (y posible análisis).
  - Gestión de gastos (archivos de gastos). Bandeja de documentos legales.

---

## 7. Servicios en segundo plano

- **Email:** Envío transaccional (recuperación contraseña, recordatorios fianza, emails a prospectos, recaptación). Filtrado de rebotes y manejo de errores.
- **Cloud Scheduler:** Jobs para recordatorios de fianza (cada 10 min en ventana diurna), y otros procesos programados que consuman endpoints admin o internos.

---

## 8. Accesibilidad e inclusión

- **Modo invidente (is_blind):** Registro en setup con `is_blind` desde URL o formulario; narración en Setup Wizard; experiencia auditiva en `/access` (Ana/Lex por voz); lectores de pantalla (NVDA, JAWS, VoiceOver) optimizados en dashboard.
- **Narración ligera:** En dashboard, soporte para que las transiciones y estados importantes sean anunciables.

---

## 9. Páginas legales y estáticas

- **Rutas:** `/aviso legal`, `/condiciones`, `/cookies`, `/devolucion`, `/garantia`, `/privacidad`, `/rgpd`, `/terminos`, `/pagos`.
- **Analogía:** Documentación oficial de la central (términos, privacidad, RGPD, devoluciones, garantía, política de pagos, cookies).

---

## 10. Resumen de flujos clave

| Flujo | Dónde | Qué hace |
|-------|--------|----------|
| Registro con referido | `/setup?ref=CODIGO` | Alta clínica vinculada a referidor; créditos referidos. |
| Completar configuración | Dashboard (Setup Wizard) | Logo → Licencia → Stripe; sin esto, modo limitado (SetupLockView). |
| Reserva + fianza | Portal paciente / CRM | Cita creada; recordatorio 1 h antes de expiración de fianza vía job. |
| Recaptación | Balance → “Desplegar campaña” | Ana contacta pacientes sin cita reciente; emails con rate limit. |
| Prospección Foundry | Foundry → Caza | Importar leads, activar campaña, cambiar estados, envío manual de emails. |
| Legal y obligaciones | Lex Legal + sidebar | Estado RGPD, contratos, obligaciones (logo, Stripe, suscripción). |
| Instalar app | Dashboard → Instalar App | PWA con manifest y service worker; instalación desde navegador. |

---

Esta analogía cubre **todas** las funcionalidades identificadas en el código: landing, auth, setup, referidos, dashboard (todos los módulos), agenda con semáforo y modales, pacientes con importación y notas de voz, sedes, equipo, bonos, finanzas y recaptación, Ana, Lex, cobros (Stripe/Bizum), referidos, ajustes, sugerencias, PWA, backend y APIs, Foundry (Dios, Caza, LLC), fianzas y recordatorios, accesibilidad y páginas legales.
