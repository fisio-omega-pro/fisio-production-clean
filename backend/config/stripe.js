const { initEnv } = require('./env');
const getStripe = async () => {
    const env = await initEnv();
    return require('stripe')(env.STRIPE_SK);
};
module.exports = { getStripe };
