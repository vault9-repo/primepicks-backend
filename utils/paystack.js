const axios = require("axios");
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

const initializePayment = async (email, amount, reference) => {
  const data = {
    email,
    amount, // in kobo (KES * 100)
    reference,
    currency: "KES",
    callback_url: "http://localhost:3000/payment-callback",
  };

  const res = await axios.post("https://api.paystack.co/transaction/initialize", data, {
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
  });

  return res.data;
};

module.exports = { initializePayment };
