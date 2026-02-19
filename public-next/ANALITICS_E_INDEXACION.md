# Google Analytics e indexación

## Google Analytics (GA4)

- **Estado:** El código de Analytics **ya está integrado** en el proyecto.
- Solo se carga si el usuario **ha aceptado cookies** (banner de cookies).
- La etiqueta no hace nada hasta que configuras el ID de medición.

### Cómo activarlo

El **ID de propiedad** (ej. 518724146) no se usa en la web. Hace falta el **ID de medición** (empieza por `G-`).

1. En **Google Analytics 4**: **Admin** → **Flujos de datos** → clic en tu flujo **Web** → copia el **ID de medición** (tipo `G-XXXXXXXXXX`).
2. En **Vercel**: **Settings** → **Environment Variables**.
3. Añade:
   - **Name:** `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - **Value:** el ID de medición (ej. `G-ABC123XY`).
4. **Redeploy** para que la variable se aplique.
5. En Analytics, comprueba que lleguen datos (puede tardar unos minutos).

---

## Indexación en Google

- Una búsqueda reciente con `site:fisiotool.com` **no devolvió resultados**, así que es posible que la web aún no esté indexada o que Google aún no la haya rastreado.

### Qué hacer

1. **Google Search Console**  
   - Entra en [search.google.com/search-console](https://search.google.com/search-console).  
   - Añade la propiedad `https://www.fisiotool.com` (o el dominio que uses).  
   - Verifica el dominio (HTML, DNS o con Google Analytics si ya está vinculado).  
   - Usa **“Inspección de URLs”** y **“Solicitar indexación”** para la URL de inicio y páginas importantes.

2. **Sitemap**  
   - Si tienes un `sitemap.xml` (por ejemplo en `/sitemap.xml`), en Search Console → Sitemaps añade esa URL para que Google rastree todas las páginas.

3. **Enlaces**  
   - Enlazar la web desde redes, correos o otras páginas ayuda a que Google la descubra antes.

Cuando el sitio esté verificado e indexado, la búsqueda `site:fisiotool.com` empezará a mostrar tus páginas.
