// utils/paystack.js
const axios = require("axios");
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

async function initializePayment(email, amount, reference, callback_url) {
  try {
    const data = { email, amount, reference, callback_url, currency: "KES" };
    const res = await axios.post("https://api.paystack.co/transaction/initialize", data, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });
    return res.data; // contains data.authorization_url & reference
  } catch (err) {
    throw err;
  }
}

async function verifyPayment(reference) {
  try {
    const res = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    });
    return res.data; // contains data.status etc
  } catch (err) {
    throw err;
  }
}

module.exports = { initializePayment, verifyPayment };
