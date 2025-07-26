const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG); // usa el archivo directamente

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

    // ✅ Validar que los campos obligatorios no estén vacíos
    if (
  !nuevoPedido.nombreCliente ||
  !nuevoPedido.telefono ||
  !nuevoPedido.fechaEntrega ||
  !nuevoPedido.direccionEntrega ||
  !nuevoPedido.pinatas ||
  !Array.isArray(nuevoPedido.pinatas) ||
  nuevoPedido.pinatas.length === 0
) {
  return res.status(400).json({ error: 'Faltan campos obligatorios en el pedido' });
}

    // Agregar timestamp antes de guardar
    nuevoPedido.timestamp = admin.firestore.Timestamp.now();

    // Guardar en Firebase y registrar el ID
  const ref = await db.collection('pedidos').add(nuevoPedido);
  await ref.update({ id: ref.id }); // 🔁 guarda el ID dentro del documento

res.status(200).json({ mensaje: 'Pedido guardado correctamente' });


  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// PATCH para marcar un pedido como entregado
app.patch('/pedidos/:id', async (req, res) => {
  try {
    const pedidoId = req.params.id;
    const { entregado } = req.body;

    if (typeof entregado !== 'boolean') {
      return res.status(400).json({ error: 'El valor "entregado" debe ser true o false' });
    }

    const pedidoRef = db.collection('pedidos').doc(pedidoId);
    await pedidoRef.update({ entregado });

    res.status(200).json({ mensaje: 'Estado de entrega actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(Servidor corriendo en puerto ${PORT});
});
