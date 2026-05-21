const express = require("express");
const cors = require("cors");
const axios = require("axios");
const crypto = require("crypto");
const qs = require("querystring");

const app = express();

app.use(cors());
app.use(express.json());

/* 🔐 CREDENCIALES FLOW */
const FLOW_API_KEY =
  "5A3C4FB1-B261-4308-B1C6-7D330D1L5B49";

const FLOW_SECRET_KEY =
  "371692b7b22234b0172022206b744e5731c66c6e";

/* =======================================
   🚀 CREAR LINK DE PAGO FLOW
======================================= */
app.post("/crear-pago", async (req, res) => {

  try {

    const { total, nombre } = req.body;

    console.log(
      "💰 Datos recibidos:",
      total,
      nombre
    );

    /* 🔥 VALIDAR TOTAL */
    if (!total) {

      return res.status(400).json({
        error: "Falta el total"
      });

    }

    /* =======================================
       📦 PARAMETROS FLOW
    ======================================= */
    const params = {

      apiKey:
        FLOW_API_KEY,

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

      /* 🔥 WEBHOOK */
      urlConfirmation:
        "https://pagos-server.onrender.com/webhook",

      /* 🔥 RETORNO CLIENTE */
      urlReturn:
        "https://locreamosdigital.cl/pagoExitoso"

    };

    /* =======================================
       🔐 GENERAR FIRMA FLOW
    ======================================= */

    const keys =
      Object.keys(params).sort();

    let toSign = "";

    keys.forEach((key) => {

      toSign +=
        key + params[key];

    });

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
      "🔐 Firma generada correctamente"
    );

    console.log(
      "📡 Enviando a Flow..."
    );

    /* =======================================
       🚀 CREAR PAGO FLOW
    ======================================= */

    const response =
      await axios.post(

        "https://www.flow.cl/api/payment/create",

        qs.stringify(params),

        {
          headers: {

            "Content-Type":
              "application/x-www-form-urlencoded"

          }
        }

      );

    const data =
      response.data;

    console.log(
      "✅ FLOW RESPONSE:"
    );

    console.log(data);

    /* =======================================
       🔥 VALIDAR RESPUESTA FLOW
    ======================================= */

    if (
      !data.url ||
      !data.token
    ) {

      console.log(
        "❌ Flow no devolvió URL válida"
      );

      return res.status(500).json({

        error:
          "Flow no devolvió URL válida",

        flowResponse:
          data

      });

    }

    /* =======================================
       🔥 URL FINAL FLOW
    ======================================= */

    const urlPago =

      data.url +
      "?token=" +
      data.token;

    console.log(
      "🚀 URL FINAL:",
      urlPago
    );

    return res.json({

      url: urlPago

    });

  } catch (error) {

    console.log(
      "❌ ERROR FLOW:"
    );

    console.log(
      error.response?.data
    );

    console.log(
      error.message
    );

    return res.status(500).json({

      error:
        "Error real desde servidor",

      detalle:
        error.response?.data ||
        error.message

    });

  }

});

/* =======================================
   🧪 WEBHOOK FLOW
======================================= */
app.post("/webhook", (req, res) => {

  console.log(
    "📩 Confirmación Flow:"
  );

  console.log(req.body);

  // 🔥 AQUÍ LUEGO:
  // - validar pago aprobado
  // - guardar pedido
  // - enviar whatsapp
  // - imprimir cocina

  res.sendStatus(200);

});

/* =======================================
   🧪 TEST
======================================= */
app.get("/", (req, res) => {

  res.send(
    "Servidor FLOW activo ✅"
  );

});

/* =======================================
   🚀 PUERTO
======================================= */
const PORT =
  process.env.PORT || 3001;

app.listen(PORT, () => {

  console.log(
    `🔥 Servidor corriendo en puerto ${PORT}`
  );

});
