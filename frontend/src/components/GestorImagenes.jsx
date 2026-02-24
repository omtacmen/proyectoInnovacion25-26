import React, { useState } from 'react';

export default function GestorImagenes({ cambiarVista, imagenes, setImagenes, elementosSala, setElementosSala, nombreTematica }) {
  const [archivoLocal, setArchivoLocal] = useState(null); 
  const [previewUrl, setPreviewUrl] = useState(null); // Para ver la miniatura antes de subirla
  const [nuevaDesc, setNuevaDesc] = useState('');
  const [nuevoTipo, setNuevoTipo] = useState('cuadro');
  
  const [filtroActual, setFiltroActual] = useState('todos');
  const [imagenAEliminar, setImagenAEliminar] = useState(null);

  // Seleccionar archivo del PC
  const manejarSeleccionImagen = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      setArchivoLocal(archivo);
      setPreviewUrl(URL.createObjectURL(archivo)); // Crea una URL temporal para la previsualización
    }
  };

  // Enviar archivo al servidor Node.js
  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (!archivoLocal) return alert("Por favor, selecciona una imagen de tu PC.");

    // Preparamos el archivo para enviarlo como "formulario multipart"
    const formData = new FormData();
    formData.append('imagen', archivoLocal);

    try {
      // 1. Enviamos la imagen física a nuestro servidor local
      const respuesta = await fetch('http://localhost:5005/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await respuesta.json();

      if (data.url) {
        // 2. El servidor nos devuelve la URL de la imagen guardada
        const nuevaImagen = { 
          id: Date.now(), 
          url: data.url, // Ej: http://localhost:5005/uploads/12345.jpg
          descripcion: nuevaDesc, 
          tipo: nuevoTipo 
        };
        
        setImagenes([...imagenes, nuevaImagen]);
        
        // Limpiamos el formulario
        setArchivoLocal(null);
        setPreviewUrl(null);
        setNuevaDesc('');
        document.getElementById('input-archivo').value = ''; 
      }
    } catch (error) {
      console.error("Error al subir imagen:", error);
      alert("Error al conectar con el servidor para subir la imagen.");
    }
  };

  // --- LÓGICA DE LA PAPELERA ---
  const handleDragStart = (e, img) => e.dataTransfer.setData('imagenId', img.id.toString());
  const handleDragOverPapelera = (e) => e.preventDefault();
  const handleDropPapelera = (e) => {
    e.preventDefault();
    const idStr = e.dataTransfer.getData('imagenId');
    if (idStr) setImagenAEliminar(imagenes.find(i => i.id === parseInt(idStr)));
  };

  const confirmarEliminacion = () => {
    setImagenes(imagenes.filter(img => img.id !== imagenAEliminar.id));
    if (estaEnUso) {
      setElementosSala(elementosSala.map(el => el.imagen === imagenAEliminar.url ? { ...el, imagen: null } : el));
    }
    setImagenAEliminar(null);
  };

  const estaEnUso = imagenAEliminar ? elementosSala.some(el => el.imagen === imagenAEliminar.url) : false;
  const imagenesFiltradas = imagenes.filter(img => filtroActual === 'todos' ? true : img.tipo === filtroActual);

  const editarImagen = (e, idActual) => {
    e.stopPropagation();
    const img = imagenes.find(i => i.id === idActual);
    const nuevaDesc = window.prompt('Editar descripción de la imagen:', img.descripcion);
    if (nuevaDesc !== null) {
      setImagenes(imagenes.map(i => i.id === idActual ? { ...i, descripcion: nuevaDesc } : i));
    }
  };

  const clickBorrarImagen = (e, img) => {
    e.stopPropagation();
    setImagenAEliminar(img); // Esto abre el modal de confirmación que ya teníamos
  };

  return (
    <div className="gestor-container">
      <header className="gestor-header">
        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
          <button className="btn-volver" style={{width: 'auto'}} onClick={() => cambiarVista('calendario')}>📅 Volver</button>
          <h1>Gestor: {nombreTematica}</h1>
        </div>
        <button className="btn-acceder" onClick={() => cambiarVista('sala')}>Acceder a la Sala 🚪</button>
      </header>

      <div className="gestor-contenido">
        <aside className="gestor-formulario">
          <h2>Subir Imagen Local</h2>
          <form onSubmit={manejarEnvio}>
            <div className="form-group">
              <label>Selecciona una foto de tu PC:</label>
              <input 
                id="input-archivo"
                type="file" 
                accept="image/*" 
                onChange={manejarSeleccionImagen} 
                required 
              />
            </div>
            
            {previewUrl && (
              <div style={{marginTop: '10px', textAlign: 'center'}}>
                <img src={previewUrl} alt="Previa" style={{width: '100%', height: '120px', objectFit: 'cover', borderRadius: '6px'}} />
              </div>
            )}

            <div className="form-group">
              <label>Descripción:</label>
              <input type="text" placeholder="Ej: Logo principal..." value={nuevaDesc} onChange={(e) => setNuevaDesc(e.target.value)} />
            </div>
            <div className="form-group">
              <label>¿Para qué es esta imagen?</label>
              <select value={nuevoTipo} onChange={(e) => setNuevoTipo(e.target.value)}>
                <option value="cuadro">Para Cuadros</option>
                <option value="mesa">Para Mesas</option>
              </select>
            </div>
            <button type="submit" className="btn-guardar">Guardar en Base de Datos</button>
          </form>
        </aside>

        <main className="gestor-galeria-wrapper">
          <div className="gestor-galeria">
            <div className="galeria-header">
              <h2>Imágenes Guardadas</h2>
              <div className="filtros">
                <button className={`btn-filtro ${filtroActual === 'todos' ? 'activo' : ''}`} onClick={() => setFiltroActual('todos')}>Todas</button>
                <button className={`btn-filtro ${filtroActual === 'cuadro' ? 'activo' : ''}`} onClick={() => setFiltroActual('cuadro')}>🖼️ Cuadros</button>
                <button className={`btn-filtro ${filtroActual === 'mesa' ? 'activo' : ''}`} onClick={() => setFiltroActual('mesa')}>🪑 Mesas</button>
              </div>
            </div>
            <div className="galeria-grid">
              {imagenesFiltradas.length === 0 ? (
                <p className="texto-vacio">No has subido ninguna imagen todavía.</p>
              ) : (
                imagenesFiltradas.map(img => (
                  <div key={img.id} className="tarjeta-imagen" draggable onDragStart={(e) => handleDragStart(e, img)}>
                    
                    {/* ¡NUEVO! Botones superpuestos */}
                    <div className="tarjeta-acciones-img">
                      <button className="btn-icono editar" title="Editar" onClick={(e) => editarImagen(e, img.id)}>✏️</button>
                      <button className="btn-icono borrar" title="Borrar" onClick={(e) => clickBorrarImagen(e, img)}>🗑️</button>
                    </div>

                    <img src={img.url} alt={img.descripcion} draggable={false} />
                    <div className="tarjeta-info">
                      <strong>{img.tipo.toUpperCase()}</strong>
                      <p>{img.descripcion}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="zona-papelera" onDragOver={handleDragOverPapelera} onDrop={handleDropPapelera}>
            🗑️ Arrastra una imagen aquí para eliminarla
          </div>
        </main>
      </div>

      {imagenAEliminar && (
        <div className="modal-overlay">
          <div className="modal-content modal-alerta">
            <h3>⚠️ Confirmar eliminación</h3>
            {estaEnUso && <p className="alerta-peligro">¡Cuidado! Esta imagen <strong>está en la Sala</strong>. Si la eliminas, desaparecerá de allí también.</p>}
            <p>¿Seguro que quieres borrarla?</p>
            <div className="imagen-previa-modal"><img src={imagenAEliminar.url} alt="Previa" /></div>
            <div className="botones-modal">
              <button className="btn-cancelar" onClick={() => setImagenAEliminar(null)}>No, mantener</button>
              <button className="btn-confirmar-eliminar" onClick={confirmarEliminacion}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}