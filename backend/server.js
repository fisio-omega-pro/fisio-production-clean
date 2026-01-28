const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const { initEnv } = require('./config/env');
const helmet = require('helmet');
const apiRoutes = require('./routes/apiRoutes');

async function initialize() {
  await initEnv();
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: '*' }));
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use('/api', apiRoutes);
  app.get('/', (req, res) => res.status(200).send('FISIOTOOL PRO ONLINE'));

  const PORT = process.env.PORT || 8080;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 MOTOR OMEGA ONLINE | PUERTO: ${PORT}`);
  });
}

initialize().catch(e => {
  console.error("🔥 FALLO AL INICIAR:", e.message);
  process.exit(1);
});
