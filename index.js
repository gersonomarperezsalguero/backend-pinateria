const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const serviceAccount = require('./firebase-key.json'); // usa el archivo directamente

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API de Piñatería Las Palmas funcionando');
});

app.post('/pedidos', async (req, res) => {
  try {
    const nuevoPedido = req.body;
    nuevoPedido.timestamp = admin.firestore.Timestamp.now();
    await db.collection('pedidos').add(nuevoPedido);
    res.status(200).json({ mensaje: 'Pedido guardado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
