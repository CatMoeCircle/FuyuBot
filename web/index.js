import express from "express";
import { checkAndLoadEnv, login } from "../login.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

checkAndLoadEnv();

app.post("/bot-login", async (req, res) => {
  const { stringSession, token } = req.body;

  try {
    const client = await login({ stringSession, token, Bot: true });
    res.status(200).send({ message: "Bot logged in successfully!", client });
  } catch (error) {
    res.status(500).send({ message: "Bot login failed", error: error.message });
  }
});

app.post("/user-login", async (req, res) => {
  const { stringSession, phone } = req.body;

  try {
    const client = await login({ stringSession, phone, Bot: false });
    res.status(200).send({ message: "User logged in successfully!", client });
  } catch (error) {
    res
      .status(500)
      .send({ message: "User login failed", error: error.message });
  }
});

app.post("/send-code", async (req, res) => {
  const { phone } = req.body;

  try {
    console.log(`Sending verification code to ${phone}`);

    res.status(200).send({ message: "Verification code sent successfully!" });
  } catch (error) {
    res.status(500).send({
      message: "Failed to send verification code",
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
