const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

/* 🔐 ACCESS TOKEN (luego lo moveremos a variable de entorno) */
const ACCESS_TOKEN = "APP_USR-3840784826968925-042810-481f06ae904d7cb715b21f6b95b7c19a-3365977450";

/* 🚀 CREAR LINK DE PAGO */
app.post("/crear-pago", async (req, res) => {
  try {
    const { total, nombre } = req.body;

    console.log("💰 Datos recibidos:", total, nombre);

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

      // 🔥 IDENTIFICADOR DEL PEDIDO
      external_reference: `${nombre || "Cliente"}-${Date.now()}`,

      payer: {
        name: nombre || "Cliente",
        email: "test_user@test.com"
      },

      back_urls: {
        success: "https://locreamosdigital.cl/pago-exitoso",
        failure: "https://locreamosdigital.cl/muestrapedidoscomida",
        pending: "https://locreamosdigital.cl/muestrapedidoscomida"
      },

      auto_return: "approved"
    };

    console.log("📡 Enviando a MercadoPago...");

    const response = await axios.post(
      "https://api.mercadopago.com/checkout/preferences",
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    const data = response.data;

    console.log("✅ Link generado:", data.init_point);

    return res.json({
      url: data.init_point
    });

  } catch (error) {
    console.log("❌ ERROR MP:");
    console.log(error.response?.data || error.message);

    return res.status(500).json({
      error: "Error real desde servidor"
    });
  }
});

/* 🧪 WEBHOOK (PARA FUTURO USO) */
app.post("/webhook", (req, res) => {
  console.log("📩 Notificación de MercadoPago:", req.body);

  // Aquí luego podrás:
  // - validar pago aprobado
  // - enviar WhatsApp automático
  // - guardar pedidos

  res.sendStatus(200);
});

/* 🚀 GUARDAR PEDIDO */
app.post("/guardar-pedido", async (req, res) => {

  try {

    // ✅ RESPONDER INMEDIATO
    res.json({
      ok: true
    });

    // 🔥 DATOS DEL PEDIDO
    const pedido = req.body;

    console.log("📦 Pedido recibido");

    // 🔥 URL APPS SCRIPT
    const APPS_SCRIPT_URL =
      "https://script.google.com/macros/s/AKfycbwXkgHFQKPGgVHFRavqTlQ_8h3H6MT84ndH2feNSccGZwfw5YaBvj5EbyGNDEe875Tw/exec";

    // 🚀 ENVIAR A GOOGLE SHEETS
    await axios.post(
      APPS_SCRIPT_URL,
      pedido,
      {
        headers: {
          "Content-Type":
            "application/json"
        }
      }
    );

    console.log(
      "✅ Pedido enviado a Google Sheets"
    );

  } catch (error) {

    console.log(
      "❌ Error guardando pedido:"
    );

    console.log(
      error.response?.data ||
      error.message
    );

  }

});

/* TEST */
app.get("/", (req, res) => {
  res.send("Servidor MercadoPago activo ✅");
});

/* 🚀 PUERTO CORRECTO PARA RENDER */
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🔥 Servidor corriendo en puerto ${PORT}`);
});
