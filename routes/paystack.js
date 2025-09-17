router.post("/webhook", async (req, res) => {
  try {
    const event = req.body;

    if (event.event === "charge.success") {
      const { email, metadata } = event.data.customer;

      // Find user
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({ email });
      }

      // Update subscription
      let expiresAt = new Date();
      const plan = metadata.plan; // daily / weekly / monthly

      if (plan === "daily") expiresAt.setDate(expiresAt.getDate() + 1);
      if (plan === "weekly") expiresAt.setDate(expiresAt.getDate() + 7);
      if (plan === "biweekly") expiresAt.setDate(expiresAt.getDate() + 14);
      if (plan === "monthly") expiresAt.setMonth(expiresAt.getMonth() + 1);

      user.subscription = {
        active: true,
        plan,
        expiresAt,
      };
      await user.save();

      console.log(`✅ Subscription updated for ${email}`);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    res.sendStatus(500);
  }
});
