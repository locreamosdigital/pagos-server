const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

/* 🔐 ACCESS TOKEN */
const ACCESS_TOKEN = "TU_TOKEN";

/* 🚀 CREAR LINK DE PAGO */
app.post("/crear-pago", async (req, res) => {

  try {

    const {
  total,
  nombre,
  whatsapp
} = req.body;

    console.log(
      "💰 Datos recibidos:",
      total,
      nombre
    );

    if (!total) {

      return res.status(400).json({
        error: "Falta el total"
      });

    }

    const paymentData = {

      items: [
        {
          title: "Pedido Sushi",
          quantity: 1,
          unit_price: Number(total),
          currency_id: "CLP"
        }
      ],

      external_reference:
        `${nombre || "Cliente"}-${Date.now()}`,

      payer: {
        name: nombre || "Cliente",
        email: "test_user@test.com"
      },

      back_urls: {

        success:
          `https://locreamosdigital.cl/pago-exitoso?msg=${whatsapp}`,

        failure:
          "https://locreamosdigital.cl/muestrapedidoscomida",

        pending:
          "https://locreamosdigital.cl/muestrapedidoscomida"

      },

      auto_return: "approved"

    };

    console.log(
      "📡 Enviando a MercadoPago..."
    );

    const response = await axios.post(

      "https://api.mercadopago.com/checkout/preferences",

      paymentData,

      {
        headers: {
          Authorization:
            `Bearer ${ACCESS_TOKEN}`,

          "Content-Type":
            "application/json"
        }
      }

    );

    const data = response.data;

    console.log(
      "✅ Link generado:",
      data.init_point
    );

    return res.json({
      url: data.init_point
    });

  } catch (error) {

    console.log("❌ ERROR MP:");

    console.log(
      error.response?.data ||
      error.message
    );

    return res.status(500).json({
      error:
        "Error real desde servidor"
    });

  }

});

/* 🧪 WEBHOOK */
app.post("/webhook", (req, res) => {

  console.log(
    "📩 Notificación de MercadoPago:",
    req.body
  );

  res.sendStatus(200);

});

/* TEST */
app.get("/", (req, res) => {
  res.send(
    "Servidor MercadoPago activo ✅"
  );
});

/* 🚀 PUERTO */
const PORT =
  process.env.PORT || 3001;

app.listen(PORT, () => {

  console.log(
    `🔥 Servidor corriendo en puerto ${PORT}`
  );

});
