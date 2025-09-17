const axios = require("axios");

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

/**
 * Initialize a Paystack payment
 * @param {string} email - Customer email
 * @param {number} amount - Amount in kobo
 * @param {string} reference - Unique payment reference
 * @param {string} callback_url - Optional callback URL
 * @returns {Promise<object>} - Paystack response
 */
const initializePayment = async (email, amount, reference, callback_url) => {
  try {
    const payload = {
      email,
      amount, // in kobo
      reference,
      currency: "KES",
      callback_url: callback_url || undefined,
    };

    const response = await axios.post("https://api.paystack.co/transaction/initialize", payload, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    // Paystack returns payment info in response.data
    return response.data;
  } catch (error) {
    console.error("Paystack initialization error:", error.response?.data || error.message);
    throw new Error("Failed to initialize payment");
  }
};

module.exports = { initializePayment };
