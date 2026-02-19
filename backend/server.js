const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// 1. PREPARAR CARPETA LOCAL PARA LAS IMÁGENES
const carpetaUploads = path.join(__dirname, 'uploads');
// Si la carpeta no existe, la crea automáticamente
if (!fs.existsSync(carpetaUploads)) {
  fs.mkdirSync(carpetaUploads);
}
// Permitimos que cualquiera (tu React o tus Quest 3) pueda ver las fotos de esta carpeta
app.use('/uploads', express.static(carpetaUploads));

// Configurar 'multer' para guardar las imágenes con su nombre y fecha
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, carpetaUploads); // Se guardan en la carpeta 'uploads'
  },
  filename: function (req, file, cb) {
    const sufijoUnico = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, sufijoUnico + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// 2. CONECTAR A MONGODB LOCAL
mongoose.connect('mongodb://127.0.0.1:27017/sala_vr_db')
  .then(() => console.log('✅ Conectado a MongoDB Local'))
  .catch(err => console.error('Error conectando a MongoDB:', err));

// 3. ESQUEMA DE BASE DE DATOS PARA TUS TEMÁTICAS
const TematicaSchema = new mongoose.Schema({
  id_frontend: String,
  nombre: String,
  año: Number,
  mes: Number,
  imagenes: Array,
  elementosSala: Array
});
const Tematica = mongoose.model('Tematica', TematicaSchema);

// 4. RUTAS DEL SERVIDOR (API)

// RUTA PARA SUBIR IMÁGENES
app.post('/api/upload', upload.single('imagen'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ninguna imagen' });
  }
  // IMPORTANTE PARA VR: Generamos la URL local para acceder a la foto
  // Nota: Cuando uses las gafas, cambiaremos 'localhost' por la IP de tu PC
  const urlLocal = `http://localhost:5000/uploads/${req.file.filename}`;
  res.json({ url: urlLocal });
});

// Obtener todas las temáticas
app.get('/api/tematicas', async (req, res) => {
  try {
    const tematicas = await Tematica.find();
    res.json(tematicas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});

// Guardar o actualizar una temática entera
app.post('/api/tematicas', async (req, res) => {
  try {
    const datos = req.body;
    const tematicaGuardada = await Tematica.findOneAndUpdate(
      { id_frontend: datos.id }, 
      datos, 
      { new: true, upsert: true } // Upsert: Si no existe, la crea
    );
    res.json(tematicaGuardada);
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar datos' });
  }
});

// Borrar una temática
app.delete('/api/tematicas/:id', async (req, res) => {
  try {
    await Tematica.findOneAndDelete({ id_frontend: req.params.id });
    res.json({ mensaje: 'Borrado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al borrar' });
  }
});

// 5. ARRANCAR EL SERVIDOR
app.listen(5000, '0.0.0.0', () => {
  console.log(`Servidor local corriendo en http://localhost:5000`);
});