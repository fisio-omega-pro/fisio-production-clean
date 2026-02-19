# ¿Es cierto lo de "protección blindada / grado militar"?

## Resumen

**Sí, la protección de los datos de pacientes es sólida y está alineada con lo que se dice en la landing**, pero había que ajustar algunas frases para que sean técnicamente exactas y no den lugar a malentendidos. Eso ya está corregido.

---

## Lo que SÍ es cierto (y lo que hay en el proyecto)

| Afirmación | Realidad técnica |
|------------|-------------------|
| **Cifrado en reposo** | Google Cloud Firestore cifra todos los datos en disco con **AES-256** por defecto. Los datos de pacientes están cifrados en reposo. |
| **Cifrado en tránsito** | Toda la comunicación es por **HTTPS (TLS)**. API (Cloud Run), front (Vercel) y Stripe usan TLS. Los datos "en tránsito" van cifrados. |
| **Alojamiento en la UE** | Según vuestra documentación legal, los datos de salud se alojan en **Google Cloud (región Bélgica / UE)**. Firestore permite elegir región (eur3/europe-west, etc.). |
| **Credenciales y secretos** | Las claves sensibles (JWT, Stripe, correo) están en **Google Secret Manager**, no en código. |
| **RGPD / Encargado** | Tenéis la estructura legal (Encargado del Tratamiento, CCT, etc.) descrita en privacidad y RGPD. |

Por tanto, **sí** podéis decir que los datos de las clínicas de fisioterapia tienen **protección fuerte** (cifrado en reposo y en tránsito, infraestructura en la UE, secretos gestionados de forma segura). Eso es lo que en la práctica se entiende por “blindaje” de datos.

---

## Lo que se ha corregido en los textos

1. **"Cifrado asimétrico AES-256"** (FAQ)  
   - **Problema:** AES-256 es cifrado **simétrico**, no asimétrico.  
   - **Cambio:** Se ha sustituido por algo del estilo: “cifrado AES-256 en reposo (Google Cloud/Firestore) y TLS en tránsito”.

2. **"Cifrado grado militar" y "solo el profesional posea la clave"** (TrustBar)  
   - **Problema:** “Grado militar” no es una certificación oficial; y la “clave de lectura” no la tiene solo el profesional: la plataforma (y Google) pueden acceder a los datos; el control es por **autenticación y permisos**, no por cifrado E2E donde solo el profesional tiene la clave.  
   - **Cambio:** Se ha pasado a “Cifrado de alto nivel” y a una redacción que indica: AES-256 en reposo, TLS en tránsito, acceso restringido al profesional autorizado mediante autenticación.

3. **"Fortaleza cifrada de grado militar"** (página Access / Lex)  
   - **Problema:** Misma idea de “grado militar” y posible confusión.  
   - **Cambio:** Se ha sustituido por una frase que habla de “infraestructura cifrada (AES-256 en reposo, TLS en tránsito) en la UE”.

Con estos cambios, **lo que dice la landing y la app sobre protección de datos de pacientes es correcto y verificable** (Google Cloud, Firestore, TLS, Secret Manager, RGPD).

---

## Conclusión

- **¿Es cierto que concedéis “protección blindada” a los datos de pacientes?**  
  **Sí:** cifrado AES-256 en reposo, TLS en tránsito, infraestructura en la UE y gestión segura de secretos.

- **¿Era correcto decir “grado militar”?**  
  Es un término comercial; no hay certificación “militar”. Por eso se ha sustituido por descripciones técnicas concretas (AES-256, TLS, acceso restringido), que sí son comprobables y adecuadas para una app que recoge datos de pacientes de clínicas de fisioterapia.
