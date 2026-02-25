# Configuración de emails – FisioTool Pro

Resumen de qué cuenta se usa para cada flujo y cómo está configurado el **modo Caza** (prospección con Ana).

---

## 1. Cuentas recomendadas

| Cuenta | Variable (env / Secret Manager) | Uso |
|--------|----------------------------------|-----|
| **ana@fisiotool.com** | `ANA_MAIL` (EMAIL_USER_ANA, EMAIL_PASS_ANA) | Ana envía y recibe: **modo Caza** (prospección), respuestas a tickets consulta, bienvenida, recaptación. También **lee** este buzón para responder a leads. |
| **fisiotoolsaas@gmail.com** | `ADMIN_EMAIL` y (opcional) `INFO_MAIL` | Donde **llegan** tickets y alertas LLC. Si INFO_MAIL es esta misma cuenta, los avisos al equipo se envían "desde" FisioTool Info hacia ADMIN_EMAIL. |

---

## 2. Modo Caza (prospección) – Ana prospecta desde ana@fisiotool.com

- **Envío:** Todos los emails de prospección (autopiloto y manual desde Foundry) se envían con **`type: 'ANA'`** → cuenta **ANA_MAIL** = **ana@fisiotool.com**.
  - `cazaAutopilotService.js`: envía con `sendEmail(..., type: 'ANA')`.
  - `adminController.sendProspectEmail`: envía con `sendEmail(..., type: 'ANA')`.
- **Recepción:** Las respuestas de los leads llegan al mismo buzón; **emailReaderService** usa **ANA_MAIL** para leer el INBOX y que Ana procese las respuestas (clasificación, respuesta automática, actualización de estado del lead).

Configuración mínima para que Caza funcione:

1. **ANA_MAIL** = ana@fisiotool.com (usuario y contraseña en Secret Manager: EMAIL_USER_ANA, EMAIL_PASS_ANA).
2. En Foundry → **MODO CAZA**: importar leads, activar campaña, enviar email manual o dejar que el autopiloto envíe (cron o `POST /api/admin/run-caza-autopilot`).

---

## 3. Plantillas de los mails (prospección)

Las “plantillas” de los emails de prospección **no** están en un archivo aparte tipo “plantilla_caza.txt”. Están definidas en código:

- **`backend/services/anaService.js`** → función **`generateProspectEmail(leadInfo)`**:
  - **Primer contacto:** foco en dolor (huecos, no-shows, agenda), una pregunta que les haga reconocerse, sin precio, un enlace al final.
  - **Seguimientos:** tocar el dolor, ofrecer solución, incluir “30 días de prueba gratis…”, opcional ROI (2 citas recuperadas), sin poner precio.
  - **Ángulos A/B/C:** A = economía/caos, B = tiempo/paz mental, C = crecimiento/equipo/sedes.
  - Reglas: un solo enlace, tono cercano, opt-out “responde NO”, firma “Ana · FisioTool”, máx. ~160 palabras.

Si en algún momento tenías plantillas en otro sitio (doc, Firestore, etc.), se pueden integrar leyendo desde ahí y pasando el texto a `generateProspectEmail` o al `sendEmail`; hoy el contenido se genera con IA a partir de ese prompt/estrategia.

**Plantillas HTML genéricas** (bienvenida, etc.): `backend/services/emailTemplates.js` → `baseEmailHtml` (cabecera, pie, estilo). No se usan para los emails de prospección en modo Caza (esos son texto plano generado por Ana).

---

## 4. Resumen por flujo

| Flujo | Desde (FROM) | Hacia (TO) |
|-------|----------------|------------|
| **Modo Caza – enviar prospección** | ANA_MAIL (ana@fisiotool.com) | Email del lead |
| **Modo Caza – leer respuestas** | Buzón ANA_MAIL (ana@fisiotool.com) | — |
| **Ticket consulta – Ana responde al usuario** | ANA_MAIL (ana@fisiotool.com) | Email de la clínica |
| **Ticket consulta – aviso al equipo** | INFO_MAIL | ADMIN_EMAIL (fisiotoolsaas@gmail.com) |
| **Ticket técnico urgente** | INFO_MAIL | ADMIN_EMAIL |
| **Alertas LLC (plazos 3/2/1 días)** | INFO_MAIL | ADMIN_EMAIL |
| **Sugerencias** | — | No se envía email; solo se guardan en BD. |

Si **ANA_MAIL** está configurado como **ana@fisiotool.com**, el modo Caza ya está usando esa cuenta para prospectar y para recibir las respuestas de los posibles usuarios.
