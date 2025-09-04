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
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));


app.get('/', (req, res) => {
  res.send('API de Piñatería Las Palmas funcionando');
});

// ✅ Crear pedido
app.post('/pedidos', async (req, res) => {
  try {
    const nuevoPedido = req.body;

    // Validar campos obligatorios
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
    nuevoPedido.entregado = false;
    nuevoPedido.enCamino = false;

    // Guardar en Firebase
    const docRef = await db.collection('pedidos').add(nuevoPedido);

    res.status(200).json({ mensaje: 'Pedido guardado correctamente', id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Obtener pedidos (incluye id)
app.get('/pedidos', async (req, res) => {
  try {
    const snapshot = await db.collection('pedidos').orderBy('timestamp', 'desc').get();
    const pedidos = snapshot.docs.map(doc => ({
      id: doc.id, // 👈 importante
      ...doc.data()
    }));
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Actualizar estado o campos de un pedido
app.patch('/pedidos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cambios = req.body;

    if (!cambios || Object.keys(cambios).length === 0) {
      return res.status(400).json({ error: 'No se enviaron cambios' });
    }

    const pedidoRef = db.collection('pedidos').doc(id);
    const pedidoDoc = await pedidoRef.get();

    if (!pedidoDoc.exists) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    await pedidoRef.update(cambios);

    res.json({ mensaje: 'Pedido actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Eliminar pedido
app.delete('/pedidos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const pedidoRef = db.collection('pedidos').doc(id);
    const pedidoDoc = await pedidoRef.get();

    if (!pedidoDoc.exists) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    await pedidoRef.delete();

    res.json({ mensaje: 'Pedido eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

// ✅ Crear producto
app.post('/productos', async (req, res) => {
  try {
    const nuevoProducto = req.body;

    if (!nuevoProducto.nombre || !nuevoProducto.detalles || !nuevoProducto.precio || !nuevoProducto.foto) {
      return res.status(400).json({ error: 'Faltan campos obligatorios en el producto' });
    }

    // Guardar en Firestore
    const docRef = await db.collection('productos').add({
      ...nuevoProducto,
      timestamp: admin.firestore.Timestamp.now(),
    });

    res.status(200).json({ mensaje: 'Producto guardado correctamente', id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Obtener todos los productos
app.get('/productos', async (req, res) => {
  try {
    const snapshot = await db.collection('productos').orderBy('timestamp', 'desc').get();
    const productos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Eliminar producto
app.delete('/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const productoRef = db.collection('productos').doc(id);
    const productoDoc = await productoRef.get();

    if (!productoDoc.exists) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await productoRef.delete();

    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Editar producto parcialmente
app.patch('/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cambios = req.body;

    if (!cambios || Object.keys(cambios).length === 0) {
      return res.status(400).json({ error: 'No se enviaron cambios' });
    }

    const productoRef = db.collection('productos').doc(id);
    const productoDoc = await productoRef.get();

    if (!productoDoc.exists) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await productoRef.update(cambios);

    res.json({ mensaje: 'Producto actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 

