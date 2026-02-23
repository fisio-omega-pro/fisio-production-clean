# Auditoría: Lex Legal en el dashboard

## Qué es Lex Legal

**Lex** está definido como el "Director Legal y Fiscal" de una LLC tecnológica (Wyoming/Delaware, USA) propiedad de un residente en España. En el código es un asistente IA especializado en:

1. **Fiscalidad USA:** Single-Member LLC de no residente, Formulario 5472 y 1120, plazos (abril), multas ($25.000 por fallo), nexo físico.
2. **Fiscalidad Europa:** IVA en ventas SaaS a particulares en Europa, Ventanilla Única (OSS/IOSS).
3. **Privacidad:** RGPD, datos de salud cifrados y en servidores europeos (p. ej. Firestore eur3).

**Misión declarada:** Responder dudas fiscales con prudencia, recordar fechas clave, no dar consejo legal vinculante y sugerir revisión final.

**Tono:** Serio, preciso, jurídico pero entendible.

---

## Dónde está implementado

| Componente | Ubicación | Función |
|------------|-----------|---------|
| **Servicio Lex** | `backend/services/lexService.js` | `consultLex(userMessage)` → usa un `model` de `config/vertexai` (Vertex AI) con un SYSTEM_PROMPT fijo. Devuelve `{ reply: text }`. |
| **Config Vertex** | `backend/config/vertexai.js` | **No existe** en el repo. lexService hace `require('../config/vertexai')`, por lo que **Lex fallaría al ejecutarse** si se invocara. |
| **Chat dashboard** | `backend/controllers/chatController.js` | `handleChat` solo llama a `anaService.processMessage`. **No mira el parámetro `agent`** del body. |
| **Ruta** | `POST /api/chat/dashboard` | Única ruta de chat del dashboard; no hay ruta específica para Lex. |
| **Frontend** | `public-next/.../LegalView.tsx` | Envía `{ message, agent: 'lex' }` a `/api/chat/dashboard`. Muestra "SALA DE CONSULTA JURÍDICA", chat con Lex, y sidebar con estado legal (RGPD, contratos, obligaciones). |

---

## Qué puede hacer por el usuario (diseño)

- Consultar dudas **fiscales** (USA y Europa) y de **cumplimiento RGPD**.
- Recibir recordatorios de **fechas** (abril IRS, trimestres IVA).
- Obtener **pautas técnicas** sin consejo vinculante, con sugerencia de revisión por profesional.

---

## Problemas detectados

1. **Lex no se usa en el dashboard:** El frontend envía `agent: 'lex'`, pero el backend ignora `agent` y siempre ejecuta Ana. El usuario en "Lex Legal" recibe respuestas de **Ana**, no de Lex.
2. **Lex depende de Vertex AI inexistente:** `lexService.js` requiere `config/vertexai.js`, que no está en el proyecto. Cualquier llamada a `consultLex` provocaría error al cargar el módulo o al usar `model`.
3. **Ruta admin "chat-legal":** `POST /admin/chat-legal` usa `anaService.processAdminConsultation` (Ana en rol CFO/Legal), no `lexService.consultLex`. Es otra Ana, no Lex.

---

## Resumen

| Pregunta | Respuesta |
|----------|-----------|
| ¿Qué función tiene Lex Legal en el dashboard? | Ser la sala de consulta jurídica y fiscal para el usuario (CEO/clínica): dudas LLC USA, IVA Europa, RGPD. |
| ¿Qué puede hacer por el usuario? | Responder consultas sobre fiscalidad USA/Europa y RGPD, con tono serio y sin consejo vinculante. Recordar fechas (abril IRS, trimestres IVA). |
| ¿Funciona hoy? | **Sí** (tras la corrección). El chat del dashboard, cuando `agent: 'lex'`, llama a `anaService.consultLex` y responde con el prompt jurídico/fiscal. Lex usa la misma API Gemini que Ana (GOOGLE_AI_KEY), no Vertex. |

---

## Corrección aplicada

1. **chatController.handleChat:** Si `req.body.agent === 'lex'`, se llama a `anaService.consultLex(message)` y se devuelve esa respuesta; en caso contrario se usa `processMessage` (Ana).
2. **anaService.consultLex:** Nueva función que usa `callAnaEngine` (misma API que Ana) con `LEX_SYSTEM_PROMPT` (fiscalidad USA/Europa, RGPD, tono Lex). Sin dependencia de `config/vertexai`.
3. El archivo `backend/services/lexService.js` (Vertex) sigue existiendo pero no se usa desde el dashboard; puede eliminarse o reservarse para un futuro uso con Vertex.
