mkdir -p src/app/setup
# Entramos al taller del chasis Next.js
cd /home/lanzamientosocupacional/public-next
# Creamos la carpeta de la ruta /setup
mkdir -p src/app/setup
# Creamos el archivo vacío para que lo edites
touch src/app/setup/page.tsx
# Confirmación de éxito
echo "✅ Carpeta /setup y archivo page.tsx creados. Listos para el montaje."
cd /home/lanzamientosocupacional/public-next
npm run dev -- -p 8080
cd /home/lanzamientosocupacional/public-next
mkdir -p src/app/rgpd src/app/terminos
cd /home/lanzamientosocupacional/public-next
mkdir -p src/app/rgpd src/app/terminos src/app/login
npm run dev -- -p 8080
cd /home/lanzamientosocupacional/public-next
mkdir -p src/app/garantia src/app/devolucion src/app/pagos src/app/condiciones src/app/privacidad src/app/cookies
fuser -k 8080/tcp
cd /home/lanzamientosocupacional/public-next
npm run dev -- -p 8080
cd /home/lanzamientosocupacional/public-next
mkdir -p src/app/access
cd public-next && npm run dev -- -p 8080
fuser -k 8080/tcp
cd /home/lanzamientosocupacional/public-next
npm run dev -- -p 8080
cd /home/lanzamientosocupacional/public-next
mkdir -p src/app/foundry
touch src/app/foundry/page.tsx
# 1. Entramos en la carpeta de archivos públicos de Next.js
cd /home/lanzamientosocupacional/public-next/public
# 2. Creamos el motor del Service Worker
cat << 'EOF' > sw.js
// FISIOTOOL PRO - SERVICE WORKER (MOTOR DE NOTIFICACIONES)

self.addEventListener('install', (event) => {
  console.log('🏎️ Service Worker: Instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('🏎️ Service Worker: Activado y listo para recibir señales');
});

// --- ESCUCHA DE NOTIFICACIONES PUSH ---
self.addEventListener('push', function(event) {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/logo_fisiotool.png',
    badge: '/logo_fisiotool.png',
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: data.url || '/dashboard'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Aviso de Ana', options)
  );
});

// --- CLIC EN LA NOTIFICACIÓN ---
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
EOF

echo "✅ Archivo sw.js creado en public-next/public/. El Ferrari ya tiene sistema de alertas."
cd /home/lanzamientosocupacional/public-next
npm run build
cd /home/lanzamientosocupacional
gcloud run deploy fisiotool --source . --region us-central1
cd /home/lanzamientosocupacional/public-next
npm run build
gcloud auth login
4/0ATX87lPLQ-aeAuP6-CjgpXkaXScwqCfbfDPWuI9Ezy5LU6EdOZyrd_VlKPXu4dwLN_KdPA
cd /home/lanzamientosocupacional
gcloud run deploy fisiotool --source . --region us-central1
cd /home/lanzamientosocupacional/public-next
npm run build
gcloud auth login --no-launch-browser
cd /home/lanzamientosocupacional
gcloud run deploy fisiotool --source . --region us-central1
cd /home/lanzamientosocupacional
cat <<EOF > .gcloudignore
.gcloudignore
.git
.gitignore
node_modules/
public-next/node_modules/
public-next/.next/
public-next/out/
npm-debug.log
EOF

df -h .
cat <<EOF > .gcloudignore
.gcloudignore
.git
.gitignore
**/node_modules/
**/node_modules/**
public-next/.next/
public-next/out/
public-next/build/
npm-debug.log
.npm
EOF

# Borramos la caché de Next.js que pesa cientos de MB
rm -rf public-next/.next
gcloud run deploy fisiotool --source . --region us-central1
cat <<EOF > .gcloudignore
.gcloudignore
.git
.gitignore
**/node_modules/
**/node_modules/**
**/.next/
npm-debug.log
.npm
EOF

cd /home/lanzamientosocupacional/public-next
npm run build
cd /home/lanzamientosocupacional
gcloud run deploy fisiotool --source . --region us-central1 --allow-unauthenticated
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=fisiotool" --limit 5 --format="value(textPayload)"
cd /home/lanzamientosocupacional
npm install cors @google-cloud/vertexai firebase-admin nodemailer stripe axios express
npm install cors
const cors = require('cors');
app.use(cors());
cd /home/lanzamientosocupacional
npm install cors
gcloud run deploy fisiotool --source . --region us-central1 --allow-unauthenticated
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=fisiotool" --limit 5 --format="value(textPayload)"
npm install cors @google-cloud/vertexai firebase-admin nodemailer stripe axios express
node -c index.js
cd /home/lanzamientosocupacional/public-next
npm run build
cd /home/lanzamientosocupacional
node index.js
# Borramos la carpeta de librerías de Next.js (pesa mucho y no se sube)
rm -rf public-next/node_modules
# Borramos la caché de construcción
rm -rf public-next/.next
ls public-next/out
gcloud run deploy fisiotool --source . --region us-central1 --allow-unauthenticated --verbosity=info
npx next build
cd public-next
npx next build
gcloud run deploy fisiotool --source . --region us-central1.
gcloud auth login --no-launch-browser
gcloud config set project spatial-victory-480409-b7
gcloud run deploy fisiotool --source . --region us-central1 --allow-unauthenticated
node -c index.js
node index.js
node -c index.js
node index.js
# 1. Aseguramos que la carrocería Next.js esté fabricada
cd /home/lanzamientosocupacional/public-next && npm run build && cd ..
# 2. Despegamos a la estratosfera de Google Cloud
gcloud run deploy fisiotool --source . --region us-central1 --allow-unauthenticated
# 1. Asegúrate de estar en la raíz
cd /home/lanzamientosocupacional
# 2. Borrar archivos HTML y JS antiguos de la carpeta public
# (Solo borramos los que ya hemos migrado a Next.js)
rm public/onboarding.html
rm public/dashboard.html
rm public/landing.html
rm public/landingbot.js
rm public/landingbot.html
# 3. Borrar archivos de prueba de la raíz
rm modelos.json
rm check_meta.js
gcloud run deploy fisiotool --source . --region us-central1
cd /home/lanzamientosocupacional/public-next
npm run build
node -c index.js
cd /home/lanzamientosocupacional
node -c index.js
cd /home/lanzamientosocupacional/public-next
npm run build
cd /home/lanzamientosocupacional
gcloud run deploy fisiotool --source . --region us-central1 --allow-unauthenticated
cd /home/lanzamientosocupacional/public-next
rm -rf .next out
npm run build
gcloud run deploy fisiotool --source . --region us-central1 --allow-unauthenticated
gcloud run deploy fisiotool --source . --region us-central1
gcloud run deploy fisiotool --source . --region us-central1 --allow-unauthenticated --clear-base-image
ls -a
node -c index.js
cd /home/lanzamientosocupacional
node index.js
cd /home/lanzamientosocupacional/public-next
npm run build
cd /home/lanzamientosocupacional/public-next
rm -rf .next out
node -c index.js
npm install bcryptjs jsonwebtoken
node -c index.js
cd ..
node -c index.js
grep -n "/api/register" index.js
sed -n '850,875p' index.js
node -c index.js
npm install bcryptjs jsonwebtoken
node -c index.js
gcloud run deploy fisiotool --source . --region us-central1 --allow-unauthenticated
gcloud auth login
gcloud config set project spatial-victory-480409-b7
gcloud run deploy fisiotool --source . --region us-central1 --allow-unauthenticated --clear-base-image
# 1. Asegúrate de estar en la raíz del proyecto
cd /home/lanzamientosocupacional
# 2. Borramos los archivos 'zombie' de la carpeta public
rm public/onboarding.html
rm public/dashboard.html
rm public/landing.html
rm public/landingbot.html
rm public/landingbot.js
rm public/politica_privacidad.html
# 3. Borramos archivos de prueba de la raíz
rm check_meta.js
rm modelos.json
cd /home/lanzamientosocupacional/public-next
npm run build
cd /home/lanzamientosocupacional/public-next
rm -rf .next out
node -c index.js
cd /home/lanzamientosocupacional
node -c index.js
npx tsc dashboard/page.tsx --noEmit --jsx react-jsx --esModuleInterop --skipLibCheck
npx -p typescript tsc dashboard/page.tsx --noEmit --jsx react-jsx --esModuleInterop --skipLibCheck
node -c server.js
lanzamientosocupacional@cloudshell:~ (spatial-victory-480409-b7)$ 
# Instala dependencias si no las tienes para el chequeo
# npm install typescript @types/react @types/node
npx tsc dashboard.page.tsx --noEmit --esModuleInterop --jsx react-jsx --skipLibCheck
node -c server.js
npm install @next/third-parties
cd /home/lanzamientosocupacional
rm public/onboarding.html
rm public/dashboard.html
rm public/landing.html
rm public/landingbot.html
rm public/landingbot.js
rm public/politica_privacidad.html
rm check_meta.js
rm modelos.json
mkdir -p backup_llaves
mv spatial-victory-480409-b7-750a3a152b30.json backup_llaves/
cd /home/lanzamientosocupacional/public-next
npm run build
cd ..
gcloud run deploy fisiotool --source . --region us-central1 --allow-unauthenticated --clear-base-image
node -c src/app/dashboard/page.tsx
cd public-next
node -c src/app/dashboard/page.tsx
npm install framer-motion lucide-react date-fns
ls -R src/app/dashboard
rm -rf .next
ls -R src/app/dashboard
rm -rf .next
npm run build
cd public-next
npm install
npm run build
npm run dev
npm run dev -- -p 8080
mkdir -p backend/config backend/middleware backend/services backend/controllers backend/routes backend/utils
node backend/server.js
cd public-next
npm run build
cd ..
node backend/server.js
find . -name server.js
mv public-next/backend .
node backend/server.js
# 1. Creamos una carpeta de seguridad
mkdir _legacy_backup
# 2. Movemos el archivo antiguo allí
mv index.js _legacy_backup/index.js.old
cd public-next
npm run build
cd ..
node backend/server.js
cd public-next
npm run build
cd ..
node backend/server.js
cd public-next 
npm run build
cd ..
node backend/server.js
npm run build en public-next
cd public-next
npm run build
cd ..
node backend/server.js
npm run build dentro de public-next
node backend/server.js
cd public-next
npm run build
cd ..
node backend/server.js
npm run build
cd ..
cd ~
node backend/server.js
cd public-next
npm run build
cd ..
node backend/server.js
cd public-next
npm run build
cd ..
cd public-next
npm run build
ls backend/controllers
cd public-next
npm run build
cd ..
node backend/server.js
cd public-next
npm run build
cd ..
node backend/server.js
curl -X POST http://localhost:8080/api/chat/dashboard -H "Content-Type: application/json" -d '{"message": "Hola Ana, prueba de sistema"}'
gcloud auth list
gcloud config get-value project
killall node
curl -i -X POST http://localhost:8080/api/chat/dashboard -H "Content-Type: application/json" -d '{"message": "Test"}'
node backend/server.js
cd public-next && npm run build && cd ..
killall node
cd public-next && npm run build && cd ..
killall node
node backend/server.js
fuser -k 8080/tcp
node backend/server.js
killall -9 node
node backend/server.js
cd public-next && npm run build && cd ..
killall -9 node
node backend/server.js
fuser -k 8080/tcp y killall -9 node
cd public-next && npm run build && cd ...
node backend/server.js
cd /home/lanzamientosocupacional
node backend/server.js
fuser -k 8080/tcp
killall -9 node
curl -X POST http://localhost:8080/api/chat/dashboard -H "Content-Type: application/json" -d '{"message": "Hola"}'
node backend/server.js
cd public-next && npm run build && cd ..
node backend/server.js
cd public-next
rm -rf .next out  # Borramos basura vieja
npm run build
cd ..
node backend/server.js
cd public-next
npm run build
cd ..
fuser -k 8080/tcp
node backend/server.js
fuser -k 8080/tcp
node backend/server.js
gcloud services enable aiplatform.googleapis.com --project=spatial-victory-480409-b7
fuser -k 8080/tcp
node backend/server.js
gcloud services enable aiplatform.googleapis.com --project=spatial-victory-480409-b7
fuser -k 8080/tcp
node backend/server.js
gcloud ai models list --region=europe-west4
gcloud services enable aiplatform.googleapis.com
fuser -k 8080/tcp
node backend/server.js
cd /home/lanzamientosocupacional
npm install @google-cloud/vertexai@latest
fuser -k 8080/tcp
node backend/server.js
fuser -k 8080/tcp
node backend/server.js
fuser -k 8080/tcp
node backend/server.js
gcloud auth application-default set-quota-project spatial-victory-480409-b7
gcloud services enable aiplatform.googleapis.com
gcloud ai models list --region=europe-west1
fuser -k 8080/tcp
node backend/server.js
gcloud projects add-iam-policy-binding spatial-victory-480409-b7     --member="user:lanzamientosocupacional@gmail.com"     --role="roles/aiplatform.user"
gcloud auth login
gcloud config set account lanzamientosocupacional@gmail.com
gcloud projects add-iam-policy-binding spatial-victory-480409-b7     --member="user:lanzamientosocupacional@gmail.com"     --role="roles/aiplatform.user"
PROJECT_NUM=$(gcloud projects describe spatial-victory-480409-b7 --format="value(projectNumber)")
gcloud projects add-iam-policy-binding spatial-victory-480409-b7     --member="serviceAccount:${PROJECT_NUM}-compute@developer.gserviceaccount.com"     --role="roles/aiplatform.user"
fuser -k 8080/tcp
node backend/server.js
gcloud auth application-default login
fuser -k 8080/tcp
node backend/server.js
unset GOOGLE_APPLICATION_CREDENTIALS
gcloud auth login
gcloud auth application-default login
fuser -k 8080/tcp
node backend/server.js
fuser -k 8080/tcp
node backend/server.js
grep "client_email" backend/config/key.json
gcloud projects add-iam-policy-binding spatial-victory-480409-b7     --member="serviceAccount:TU_EMAIL_DE_SERVICIO"     --role="roles/aiplatform.user"
gcloud projects add-iam-policy-binding spatial-victory-480409-b7     --member="serviceAccount:fisiotool-app-runner@spatial-victory-480409-b7.iam.gserviceaccount.com"     --role="roles/aiplatform.user"
fuser -k 8080/tcp
node backend/server.js
fuser -k 8080/tcp
node backend/server.js
gcloud projects add-iam-policy-binding spatial-victory-480409-b7     --member="serviceAccount:fisiotool-app-runner@spatial-victory-480409-b7.iam.gserviceaccount.com"     --role="roles/editor"
fuser -k 8080/tcp
node backend/server.js
gcloud services list --enabled --filter="name:(aiplatform.googleapis.com OR firestore.googleapis.com OR secretmanager.googleapis.com OR run.googleapis.com OR cloudscheduler.googleapis.com)" --format="table(name, state)"
gcloud projects get-iam-policy spatial-victory-480409-b7 --flatten="bindings[].members" --filter="bindings.members:serviceAccount:fisiotool-app-runner@spatial-victory-480409-b7.iam.gserviceaccount.com" --format="table(bindings.role)"
gcloud firestore databases list --format="table(name, locationId, type, state)"
gcloud firestore indexes composite list --format="table(queryScope, fieldConfig)"
gcloud secrets list --format="table(name, replication.automatic)"
gcloud secrets create JWT_SECRET --replication-policy="automatic"
# Le añadimos un valor seguro (puedes cambiarlo después)
echo -n "fisiotool_omega_master_key_2026_ultra_secure" | gcloud secrets versions add JWT_SECRET --data-file=-
gcloud firestore indexes composite create --collection-group=citas --field-config=field-path=status,order=ASCENDING --field-config=field-path=expira_el,order=ASCENDING
cd public-next && npm run build && cd ..
fuser -k 8080/tcp
node backend/server.js
npm install @google-cloud/secret-manager express cors firebase-admin @google-cloud/vertexai stripe bcryptjs jsonwebtoken
fuser -k 8080/tcp
node backend/server.js
fuser -k 8080/tcp
node backend/server.js
fuser -k 8080/tcp
node backend/server.js
cd public-next && npm run build && cd ..
node backend/server.js
user -k 8080/tcp
node backend/server.js
cd public-next && npm run build && cd ..
fuser -k 8080/tcp
node backend/server.js
fuser -k 8080/tcp
node backend/server.js
fuser -k 8080/tcp
node backend/server.js
fuser -k 8080/tcp
node backend/server.js
gcloud billing projects describe spatial-victory-480409-b7
gcloud ai models list --region=us-central1 --project=spatial-victory-480409-b7
gcloud services disable aiplatform.googleapis.com --force
gcloud services enable aiplatform.googleapis.com
gcloud ai models list --region=us-central1 --project=spatial-victory-480409-b7
fuser -k 8080/tcp
node backend/server.js
gcloud beta billing accounts list
gcloud projects create fisiotool-omega-2026 --name="Fisiotool Omega"
gcloud beta billing projects link fisiotool-omega-2026 --billing-account=01CD7F-911FE1-DB5293
# 1. Cambiamos el foco al nuevo proyecto
gcloud config set project fisiotool-omega-2026
# 2. Encendemos IA, Base de Datos y Secretos
gcloud services enable aiplatform.googleapis.com firestore.googleapis.com secretmanager.googleapis.com cloudbuild.googleapis.com
gcloud firestore databases create --location=eur3 --type=firestore-native
# 1. Crear el usuario robot
gcloud iam service-accounts create ana-brain --display-name="Cerebro Ana"
# 2. Darle poder absoluto (Editor)
gcloud projects add-iam-policy-binding fisiotool-omega-2026     --member="serviceAccount:ana-brain@fisiotool-omega-2026.iam.gserviceaccount.com"     --role="roles/editor"
# 3. Descargar la llave y sobrescribir la antigua
gcloud iam service-accounts keys create backend/config/key.json     --iam-account=ana-brain@fisiotool-omega-2026.iam.gserviceaccount.com
fuser -k 8080/tcp
node backend/server.js
fuser -k 8080/tcp
node backend/server.js
fuser -k 8080/tcp
node backend/server.js
gcloud ai models list --region=us-central1 --project=fisiotool-omega-2026
# 1. Apagar
gcloud services disable aiplatform.googleapis.com --project=fisiotool-omega-2026 --force
# 2. Esperar 5 segudos...
# 3. Encender
gcloud services enable aiplatform.googleapis.com --project=fisiotool-omega-2026
node backend/server.js
curl -X POST -H "Authorization: Bearer $(gcloud auth print-access-token)" -H "Content-Type: application/json" "https://us-central1-aiplatform.googleapis.com/v1/projects/fisiotool-omega-2026/locations/us-central1/publishers/google/models/gemini-1.0-pro:generateContent" -d '{
  "contents": [{
    "role": "user",
    "parts": [{ "text": "Hola Ana" }]
  }]
}'
zip -r MIGRACION_FISIOTOOL.zip . -x "**/node_modules/*" -x "**/.next/*" -x "**/out/*"
cd /home/lanzamientosocupacional
# Borramos la basura pesada del backend y frontend
rm -rf node_modules
rm -rf public-next/node_modules
rm -rf public-next/.next
rm -rf public-next/out
# Borramos cualquier ZIP viejo para no confundirnos
rm MIGRACION_FISIOTOOL.zip
zip -r FISIOTOOL_LIGERO.zip .
cd /home/lanzamientosocupacional
# 1. Borramos cualquier rastro de carpetas pesadas
find . -name "node_modules" -type d -prune -exec rm -rf {} +
find . -name ".next" -type d -prune -exec rm -rf {} +
rm -rf public-next/out
# 2. Borramos el ZIP gigante que creamos antes para no confundirnos
rm FISIOTOOL_LIGERO.zip
# Si esto no devuelve nada, las carpetas han desaparecido
find . -name "node_modules" -type d
find . -name ".next" -type d
ls -d public-next/out 2>/dev/null
ls FISIOTOOL_LIGERO.zip 2>/dev/null
zip -r FISIOTOOL_FINAL.zip . -x "*.git*" -x "*.cache*"
du -h --max-depth=1 | sort -hr
cd /home/lanzamientosocupacional
# Este comando solo coge tus carpetas de trabajo y los archivos sueltos necesarios
zip -r FISIOTOOL_LIMPIO.zip backend public-next package.json
cd /home/lanzamientosocupacional
# 1. Borramos las librerías (pesan 400MB+)
rm -rf node_modules
rm -rf public-next/node_modules
# 2. Borramos la caché de Next.js y la carpeta de exportación (pesan 500MB+)
rm -rf public-next/.next
rm -rf public-next/out
# 3. Borramos los zips pesados que ya tienes
rm FISIOTOOL_FINAL.zip
rm FISIOTOOL_LIMPIO.zip
# 4. Limpieza de basura de sistema
rm -rf .cache .npm
zip -r FISIOTOOL_MIGRACION.zip backend public-next public package.json package-lock.json Dockerfile README-cloudshell.txt
ls -lh FISIOTOOL_MIGRACION.zip
