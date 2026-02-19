# Revisión legal: RGPD y requisitos Stripe (pie de página y páginas)

## Resumen

**¿Está bien definido para Stripe y RGPD?** Sí, con los ajustes hechos. Tienes las páginas necesarias; el pie de página ahora enlaza correctamente a todas las que Stripe suele exigir y a las que pide el RGPD.

---

## Lo que Stripe suele exigir a nivel legal

| Requisito | ¿Lo tienes? | Dónde |
|-----------|-------------|--------|
| **Términos de Servicio** | Sí | `/terminos` — condiciones económicas, Stripe Connect, disputas, jurisdicción (Wyoming). |
| **Política de Privacidad** | Sí | `/privacidad` — responsable/encargado, datos de salud (Art. 9.2.h RGPD), IA, transferencias, derechos ARSULIPO. |
| **Política de reembolsos / cancelaciones** | Sí | `/devolucion` — garantía 30 días, depósitos anti no-show, procedimiento, desistimiento. **Ahora enlazada en el footer.** |
| **Identificación del negocio** | Sí | `/aviso-legal` — Fisiotool LLC, sede (Cheyenne, WY), contacto, LSSI-CE. **Ruta corregida:** antes el enlace era `/aviso-legal` pero la ruta real era `/aviso%20legal`; ahora existe `/aviso-legal` y el enlace funciona. |
| **Cookies** | Sí | `/cookies` — tipos, Stripe, consentimiento, ePrivacy/RGPD. |

No es obligatorio tener una página aparte solo “para pagos” si en Términos y en Reembolsos está claro cómo se cobra, quién devuelve y cómo se gestionan disputas. Tu página `/pagos` existe y explica Stripe Connect; si quieres, puedes añadirla también al footer (opcional).

---

## RGPD: lo que tienes cubierto

| Tema | Dónde |
|------|--------|
| **Responsable vs Encargado** | Privacidad + RGPD: profesional = responsable, Fisiotool LLC = encargado (Art. 28). |
| **Base legal y datos de salud** | Privacidad: Art. 9.2.h RGPD, consentimiento, finalidad (gestión clínica). |
| **IA y transparencia** | Privacidad + RGPD: Ana, EU AI Act, no entrenamiento con datos de salud. |
| **Transferencias internacionales** | Privacidad + RGPD: Google Cloud Bélgica, Cláusulas Contractuales Tipo / Data Privacy Framework. |
| **Derechos (acceso, rectificación, supresión, etc.)** | Privacidad: contacto info@fisiotool.com, coordinación con el profesional para pacientes. |
| **Encargado del tratamiento (Art. 28)** | RGPD: acuerdo encargado, soberanía de datos en la UE. |
| **Cookies y consentimiento** | Cookies: técnicas vs análisis, consentimiento (banner), enlace desde footer. |

No hace falta una página “extra” de RGPD solo para Stripe: con Privacidad + RGPD + Cookies está cubierto el tratamiento de datos y la transparencia que pide la normativa y que Stripe suele comprobar de forma indirecta (empresa seria, políticas claras).

---

## Cambios realizados en el pie de página

1. **Aviso Legal**  
   - Antes: enlace a `/aviso-legal` con la ruta real `aviso legal` (espacio) → podía dar 404.  
   - Ahora: existe la ruta `/aviso-legal` y el enlace del footer apunta ahí.

2. **Reembolsos y cancelaciones**  
   - Añadido enlace a **“Reembolsos y Cancelaciones”** → `/devolucion`.  
   - Así Stripe (y usuarios) ven desde el footer la política de reembolsos, que es lo que más suelen pedir.

Orden actual en “MARCO LEGAL” del footer: Privacidad Pro, Términos de Servicio, Contrato RGPD, Cookies, Reembolsos y Cancelaciones, Aviso Legal.

---

## Páginas que existen pero no están en el footer

- **Condiciones** (`/condiciones`) — condiciones de uso/comerciales. Puedes enlazarla si quieres (p. ej. junto a Términos) o dejarla solo desde otros sitios.
- **Garantía** (`/garantia`) — 30 días, uptime. Opcional en footer.
- **Pagos** (`/pagos`) — explicación técnica de Stripe Connect. Opcional en footer.

Para Stripe no son obligatorias en el footer; lo crítico es Términos, Privacidad, Reembolsos y negocio identificado (Aviso Legal). Con lo actual es suficiente.

---

## Conclusión

- **Requisitos básicos Stripe:** Cubiertos (términos, privacidad, reembolsos, identificación, cookies) y accesibles desde el pie de página.
- **RGPD:** Cubierto (responsable/encargado, legitimación, derechos, transferencias, cookies).  
No es necesario añadir otra página legal solo por Stripe o por RGPD; con lo que tienes y el footer actualizado es suficiente. Si más adelante Stripe o un asesor piden algo concreto (p. ej. mención explícita de “política de pagos” en el footer), se puede añadir un solo enlace a `/pagos` o a una sección dentro de Términos.
