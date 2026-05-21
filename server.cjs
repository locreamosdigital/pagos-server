const express = require("express");
const cors = require("cors");
const axios = require("axios");
const crypto = require("crypto");

const app = express();

app.use(cors());
app.use(express.json());

/* 🔐 CREDENCIALES FLOW */
const FLOW_API_KEY =
  "5A3C4FB1-B261-4308-B1C6-7D330D1L5B49";

const FLOW_SECRET_KEY =
  "371692b7b22234b0172022206b744e5731c66c6e";

/* 🚀 CREAR LINK DE PAGO FLOW */
app.post("/crear-pago", async (req, res) => {

  try {

    const { total, nombre } = req.body;

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

    /* 📦 DATOS DEL PAGO */
    const params = {

      apiKey: FLOW_API_KEY,

      commerceOrder:
        `PEDIDO-${Date.now()}`,

      subject:
        "Pedido Sushi",

      currency:
        "CLP",

      amount:
        Number(total),

      email:
        "contactanos@locreamosdigital.cl",

      // 🔥 URL CUANDO FLOW CONFIRMA EL PAGO
      urlConfirmation:
        "https://locreamosdigital.cl/webhook",

      // 🔥 URL DONDE REGRESA EL CLIENTE
      urlReturn:
        "https://locreamosdigital.cl/pagoExitoso"

    };

    /* 🔐 ORDENAR PARAMETROS */
    const keys =
      Object.keys(params).sort();

    let toSign = "";

    keys.forEach((key) => {

      toSign +=
        key + params[key];

    });

    /* 🔥 FIRMA FLOW */
    const signature =
      crypto
        .createHmac(
          "sha256",
          FLOW_SECRET_KEY
        )
        .update(toSign)
        .digest("hex");

    params.s = signature;

    console.log(
      "📡 Enviando a Flow..."
    );

    /* 🚀 CREAR PAGO */
    const response =
      await axios.post(

        "https://www.flow.cl/api/payment/create",

        null,

        {
          params
        }

      );

    const data =
      response.data;

    console.log(
      "✅ Link generado:",
      data.url +
      "?token=" +
      data.token
    );

    /* 🔥 URL FINAL */
    return res.json({

      url:
        data.url +
        "?token=" +
        data.token

    });

  } catch (error) {

    console.log(
      "❌ ERROR FLOW:"
    );

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

/* 🧪 WEBHOOK FLOW */
app.post("/webhook", (req, res) => {

  console.log(
    "📩 Confirmación Flow:",
    req.body
  );

  // Aquí luego podrás:
  // - validar pago aprobado
  // - guardar pedido
  // - imprimir cocina
  // - enviar WhatsApp

  res.sendStatus(200);

});

/* TEST */
app.get("/", (req, res) => {

  res.send(
    "Servidor FLOW activo ✅"
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
