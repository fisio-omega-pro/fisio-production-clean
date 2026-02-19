# Pasos para que funcionen Aviso Legal y Devoluciones

Sigue estos pasos **en orden**. Cuando termines, en tu web se verá el enlace "Devoluciones y reembolsos" en el pie de página y las páginas de Aviso Legal y Devoluciones dejarán de dar error.

---

## Paso 1: Abrir la terminal en la carpeta del proyecto

- Abre la terminal (o la que uses para escribir comandos).
- Ve a la carpeta del front. Escribe exactamente:

```bash
cd public-next
```

Pulsa Enter. Debes quedar dentro de la carpeta `public-next`.

---

## Paso 2: Instalar dependencias (por si acaso)

Escribe:

```bash
npm install
```

Pulsa Enter y espera a que termine. Si ya lo habías hecho antes, no pasa nada; solo tarda un poco.

---

## Paso 3: Generar el sitio (build)

Escribe:

```bash
npm run build
```

Pulsa Enter. Espera a que termine (puede tardar 1–2 minutos). Al final debería decir algo como "Export successful" o que el build terminó bien.

---

## Paso 4: Comprobar que se crearon las páginas

- Abre la carpeta **`public-next`** en tu ordenador.
- Entra en la carpeta **`out`** (se habrá creado dentro de `public-next` después del build).
- Dentro de `out` deberías ver:
  - Una carpeta llamada **`aviso-legal`** (y dentro un archivo `index.html`).
  - Una carpeta llamada **`devolucion`** (y dentro un archivo `index.html`).

Si esas dos carpetas están ahí, el build está bien.

---

## Paso 5: Subir el sitio a donde está tu web

Ahora hay que **subir todo lo que hay dentro de la carpeta `out`** al mismo sitio donde está publicada www.fisiotool.com.

- **Si usas Vercel:** Sube el proyecto de nuevo (o conecta el repositorio y haz un nuevo deploy). Asegúrate de que el directorio de salida sea `out` si te lo pide.
- **Si usas Firebase Hosting:** En la terminal, desde la raíz del proyecto, suele ser algo como `firebase deploy` después de configurar que el sitio público sea la carpeta `public-next/out` (o la carpeta que apunte a `out`).
- **Si usas otra cosa (FTP, panel del hosting, etc.):** Sube **todo el contenido** de la carpeta `out` (todas las carpetas y archivos que hay dentro) a la raíz del sitio donde se sirve www.fisiotool.com. No subas solo el `index.html` de la portada; tienen que estar también las carpetas `aviso-legal`, `devolucion`, etc.

Si me dices **con qué servicio o herramienta** publicas la web (Vercel, Firebase, nombre del hosting, etc.), te puedo decir los pasos exactos para ese caso.

---

## Paso 6: Probar en el navegador

Cuando el deploy haya terminado:

1. Abre **www.fisiotool.com**.
2. Baja hasta el **pie de página**.
3. Deberías ver un enlace que dice **"Devoluciones y reembolsos"**. Si no lo ves, haz una recarga forzada (Ctrl+F5 en Windows o Cmd+Shift+R en Mac) o prueba en una ventana de incógnito.
4. Haz clic en **"Aviso Legal"**. Debería abrirse la página de Aviso Legal, no un 404.
5. Haz clic en **"Devoluciones y reembolsos"**. Debería abrirse la página de reembolsos.

Si algo de esto no pasa, dime qué ves (por ejemplo: "sigo sin ver Devoluciones" o "Aviso Legal sigue dando 404") y en qué paso estás, y lo afinamos.

---

## Resumen en una frase

Tienes que **ejecutar el build** (`npm run build` dentro de `public-next`), **subir toda la carpeta `out`** al mismo sitio donde está www.fisiotool.com, y luego **probar** el pie de página y las dos páginas.
