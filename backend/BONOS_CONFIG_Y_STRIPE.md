# Bonos: configuración, usabilidad del fisio y cobro al cliente (Stripe)

Resumen de cómo están configurados los bonos, cómo los usa el fisio y cómo se cobra al paciente **directamente a la clínica** (no a FisioTool).

---

## 1. Configuración actual

### Dónde se puede activar o desactivar bonos (fuente única: `config_ia.acepta_bonos`)

- **Setup inicial**  
  En el registro, el fisio puede marcar “Venta de Bonos” y opcionalmente el precio del bono de 5 sesiones. Se guarda `config_ia.acepta_bonos` y `config_ia.precio_bono_5` en la clínica.

- **Dashboard → Bonos**  
  Si el módulo no está activo, se muestra el botón **“ACTIVAR MÓDULO DE BONOS”** (`POST /api/dashboard/activate-bonos`). Si ya está activo, hay un enlace **“Desactivar módulo”** que llama a `POST /api/dashboard/deactivate-bonos` (con confirmación).

- **Dashboard → Ajustes**  
  En la sección **“Bonos en tu protocolo”** hay un interruptor que activa o desactiva bonos en cualquier momento (`activate-bonos` / `deactivate-bonos`). Misma fuente de verdad: `config_ia.acepta_bonos`.

### En el dashboard (sección Bonos)

- **Activar módulo de bonos**  
  El fisio ve un bloque “Gestión de Bonos” con el botón **“ACTIVAR MÓDULO DE BONOS”**. Al pulsarlo:
  - Backend: `POST /api/dashboard/activate-bonos` → pone `config_ia.acepta_bonos = true` en la clínica.
  - No se toca Stripe; solo se activa el módulo en FisioTool.

- **Emitir bono**  
  Cuando el módulo está activo, el fisio ve **“EMITIR NUEVO BONO”**. Al pulsar se abre un modal con:
  - Nombre del paciente  
  - Número de sesiones (ej. 5 o 10)  
  - Fecha de vencimiento (opcional)  

  Al guardar:
  - Backend: `POST /api/dashboard/create-bono` con `{ bono: { paciente_nombre, sesiones_totales, fecha_vencimiento } }`.
  - Se crea un documento en la colección **`bonos`** (Firestore) con: `clinic_id`, `paciente_nombre`, `sesiones_totales`, `sesiones_restantes`, `fecha_vencimiento`, `status: 'ACTIVO'`.
  - **No se genera ningún pago ni enlace de Stripe aquí**: solo se registra que ese paciente tiene un bono de X sesiones (como un “monedero” interno).

- **Listado de bonos**  
  Se muestran tarjetas: nombre del paciente y `sesiones_restantes / sesiones_totales`. No hay hoy botón “Cobrar” ni “Enviar enlace de pago” en esta pantalla.

### En el setup (registro de la clínica)

En el formulario de alta se configuran (entre otros):

- `precio_sesion`: precio por sesión (ej. 50€).  
- `precio_bono_5`: precio del bono de 5 sesiones (ej. 225€).  
- `acepta_bonos`: si la clínica ofrece bonos.

Esos datos pueden usarse después para generar cobros (por ejemplo para el enlace de pago de un bono).

---

## 2. Usabilidad del fisio (hoy)

1. **Activar bonos** (una vez): entra en **Bonos** → “ACTIVAR MÓDULO DE BONOS”.
2. **Dar de alta un bono**: “EMITIR NUEVO BONO” → rellena paciente, sesiones, vencimiento → guardar. Queda registrado el bono en FisioTool.
3. **Ver bonos**: listado con paciente y sesiones restantes/totales.

La venta al cliente **no está automatizada en la sección Bonos**: el fisio puede estar cobrando el bono en efectivo, Bizum o por otro medio y solo usar FisioTool para **anotar** que ese paciente tiene ese bono. Por tanto, hoy el flujo es: “vendo el bono fuera (o ya lo vendí) → registro el bono en FisioTool”.

---

## 3. Cómo se cobra al cliente y relación con Stripe (venta directa clínica → paciente)

FisioTool **no** cobra el bono al paciente. El cobro es **directo a la clínica** usando Stripe Connect.

### Backend: endpoint de cobro (cita o bono)

- **Ruta:** `POST /api/dashboard/cobrar-cita-bono`
- **Body (ejemplo):** `{ "amount": 225, "concepto": "Bono 5 sesiones" }`  
  - `amount`: importe en **euros** (ej. 225 para 225€).  
  - `concepto`: texto que ve el paciente en el checkout (ej. “Bono 5 sesiones”, “Sesión 30 min”).

Comportamiento en backend:

1. Se comprueba que la clínica tenga **cuenta Stripe Connect** (`stripe_account_id`). Si no, responde error del tipo “Vincula primero tu cuenta bancaria en Pagos”.
2. Se crea una **sesión de Stripe Checkout** (pago único) con:
   - `transfer_data.destination` = **cuenta Connect de la clínica** (`stripe_account_id`).
   - `application_fee_amount: 0` → **FisioTool no se queda con ningún céntimo**; el importe va íntegro a la clínica.
3. Se devuelve **`{ url }`**: enlace de Stripe Checkout para que el paciente pague.

Flujo dinero:

- El paciente paga en Stripe (tarjeta).
- Stripe ingresa el dinero en la **cuenta Connect de la clínica** (la que vinculó en **Pagos**).
- FisioTool no recibe parte de ese pago; es una **venta directa clínica → cliente**.

### Frontend hoy

- En la sección **Bonos** **no** hay ningún botón que llame a `cobrar-cita-bono` ni que pida importe/concepto para generar el enlace.  
- El endpoint existe y está pensado para cobro directo a la clínica (cita o bono); solo falta exponerlo en la UI (por ejemplo un “Cobrar bono / Generar enlace de pago” en cada bono o en un modal).

---

## 4. Resumen

| Qué | Dónde | Stripe |
|-----|--------|--------|
| Activar/desactivar bonos | Setup (registro), Dashboard → Bonos (“ACTIVAR” / “Desactivar módulo”), Dashboard → Ajustes (interruptor “Bonos en tu protocolo”) | No. Solo `config_ia.acepta_bonos` (y `config_ia.precio_bono_5` en registro). |
| Crear bono (registrar) | Dashboard → Bonos → “EMITIR NUEVO BONO” (modal) | No. Solo Firestore `bonos`. |
| Listar bonos | Misma sección Bonos | No. |
| Cobrar bono/cita al paciente | Backend: `POST /api/dashboard/cobrar-cita-bono` con `amount` y `concepto` | Sí. Checkout con **destino = cuenta Connect de la clínica**, comisión 0 para FisioTool. |
| Vincular cuenta para cobrar | Dashboard → Pagos → “Vincular Banco” (Stripe Express) | Sí. La clínica conecta su Stripe; ese `stripe_account_id` es el destino de los cobros. |

En resumen: **los bonos se configuran y registran en el dashboard; el cobro al cliente por bono (o cita) se hace con Stripe y va 100% a la clínica**. Para que el fisio pueda “vender” el bono por Stripe desde FisioTool, solo faltaría añadir en la UI (por ejemplo en Bonos) una acción del tipo “Cobrar este bono” / “Generar enlace de pago” que llame a `cobrar-cita-bono` con el importe (ej. `precio_bono_5` de la clínica) y un concepto tipo “Bono X sesiones”.
