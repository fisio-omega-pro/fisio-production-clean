const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();
const scanInvoice = async (buffer) => {
    try {
        const [result] = await client.textDetection(buffer);
        const rawText = result.textAnnotations?.[0]?.description || "";
        const match = rawText.match(/(\d+[.,]\d{2})/);
        const importe = match ? parseFloat(match[0].replace(',', '.')) : 0;
        return { rawText, importe, moneda: "EUR" };
    } catch (e) { return { rawText: "", importe: 0, moneda: "EUR" }; }
};
module.exports = { scanInvoice };
