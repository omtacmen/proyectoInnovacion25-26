require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Permite recibir datos grandes

// 1. CONEXIÓN A MONGODB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error conectando a MongoDB:', err));

// 2. DEFINIR LA ESTRUCTURA DE LA BASE DE DATOS (ESQUEMA)
const TematicaSchema = new mongoose.Schema({
  id_frontend: String,
  nombre: String,
  año: Number,
  mes: Number,
  imagenes: Array,
  elementosSala: Array
});

const Tematica = mongoose.model('Tematica', TematicaSchema);

// 3. CREAR LAS RUTAS (API) PARA QUE REACT Y LAS QUEST 3 SE CONECTEN

// Leer todas las temáticas (GET)
app.get('/api/tematicas', async (req, res) => {
  try {
    const tematicas = await Tematica.find();
    res.json(tematicas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});

// Guardar o actualizar una temática (POST)
app.post('/api/tematicas', async (req, res) => {
  try {
    const datos = req.body;

    // Busca si ya existe. Si existe, la actualiza. Si no, la crea.
    const tematicaGuardada = await Tematica.findOneAndUpdate(
      { id_frontend: datos.id }, 
      datos, 
      { new: true, upsert: true }
    );

    res.json(tematicaGuardada);
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar datos' });
  }
});

// Borrar una temática (DELETE)
app.delete('/api/tematicas/:id', async (req, res) => {
  try {
    await Tematica.findOneAndDelete({ id_frontend: req.params.id });
    res.json({ mensaje: 'Borrado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al borrar' });
  }
});

// 4. ARRANCAR EL SERVIDOR
const PORT = process.env.PUERTO || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));