const Imap = require('imap');
const { simpleParser } = require('mailparser');
const { initEnv } = require('../config/env');
const adminController = require('../controllers/adminController');

const readEmails = async () => {
  const env = await initEnv();
  const credentials = env.ANA_MAIL; // 🚀 Ana lee su propio buzón

  if (!credentials.user || !credentials.pass) return;

  const imap = new Imap({
    user: credentials.user,
    password: credentials.pass,
    host: 'gmadm1033.siteground.biz',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
  });

  imap.once('ready', () => {
    imap.openBox('INBOX', false, (err) => {
      if (err) { imap.end(); return; }
      imap.search(['UNSEEN'], (err, results) => {
        if (err || !results || !results.length) { imap.end(); return; }
        const f = imap.fetch(results, { bodies: '' });
        f.on('message', (msg) => {
          msg.on('body', (stream) => {
            simpleParser(stream, async (e, parsed) => {
              await adminController.handleIncomingResponse({
                body: { from: parsed.from.value[0].address, text: parsed.text, channel: 'email' }
              }, { json: () => {} });
            });
          });
          msg.once('attributes', (attrs) => { imap.addFlags(attrs.uid, ['\\Seen'], () => {}); });
        });
        f.once('end', () => imap.end());
      });
    });
  });
  imap.once('error', (err) => console.error('IMAP Error:', err.message));
  imap.connect();
};
module.exports = { readEmails };
