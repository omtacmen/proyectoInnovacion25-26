import React, { useState } from 'react';

export default function GestorImagenes({ cambiarVista, imagenes, setImagenes, elementosSala, setElementosSala, nombreTematica }) {
  const [nuevaUrl, setNuevaUrl] = useState('');
  const [nuevaDesc, setNuevaDesc] = useState('');
  const [nuevoTipo, setNuevoTipo] = useState('cuadro');
  
  // ¡NUEVO! Estado para controlar el filtro actual ('todos', 'cuadro' o 'mesa')
  const [filtroActual, setFiltroActual] = useState('todos');

  // Estados para el borrado
  const [imagenAEliminar, setImagenAEliminar] = useState(null);

  const manejarEnvio = (e) => {
    e.preventDefault();
    if (!nuevaUrl) return;
    const nuevaImagen = { id: Date.now(), url: nuevaUrl, descripcion: nuevaDesc, tipo: nuevoTipo };
    setImagenes([...imagenes, nuevaImagen]);
    setNuevaUrl(''); setNuevaDesc('');
  };

  // --- LÓGICA DE LA PAPELERA ---
  const handleDragStart = (e, img) => {
    e.dataTransfer.setData('imagenId', img.id.toString());
  };

  const handleDragOverPapelera = (e) => e.preventDefault();

  const handleDropPapelera = (e) => {
    e.preventDefault();
    const idStr = e.dataTransfer.getData('imagenId');
    if (idStr) {
      const imgSeleccionada = imagenes.find(i => i.id === parseInt(idStr));
      setImagenAEliminar(imgSeleccionada);
    }
  };

  const confirmarEliminacion = () => {
    setImagenes(imagenes.filter(img => img.id !== imagenAEliminar.id));
    if (estaEnUso) {
      setElementosSala(elementosSala.map(el => 
        el.imagen === imagenAEliminar.url ? { ...el, imagen: null } : el
      ));
    }
    setImagenAEliminar(null);
  };

  const estaEnUso = imagenAEliminar 
    ? elementosSala.some(el => el.imagen === imagenAEliminar.url) 
    : false;

  // ¡NUEVO! Filtramos las imágenes antes de mostrarlas
  const imagenesFiltradas = imagenes.filter(img => {
    if (filtroActual === 'todos') return true;
    return img.tipo === filtroActual;
  });

  return (
    <div className="gestor-container">
      <header className="gestor-header">
        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
          <button className="btn-volver" style={{width: 'auto'}} onClick={() => cambiarVista('calendario')}>📅 Volver al Calendario</button>
          <h1>Gestor: {nombreTematica}</h1>
        </div>
        <button className="btn-acceder" onClick={() => cambiarVista('sala')}>Acceder a la Sala 🚪</button>
      </header>

      <div className="gestor-contenido">
        <aside className="gestor-formulario">
          <h2>Añadir Nueva Imagen</h2>
          <form onSubmit={manejarEnvio}>
            <div className="form-group">
              <label>URL de la imagen:</label>
              <input type="url" placeholder="https://ejemplo.com/foto.jpg" value={nuevaUrl} onChange={(e) => setNuevaUrl(e.target.value)} required />
            </div>
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
            <button type="submit" className="btn-guardar">Guardar Imagen</button>
          </form>
        </aside>

        <main className="gestor-galeria-wrapper">
          <div className="gestor-galeria">
            
            {/* ¡NUEVO! Cabecera de la galería con los botones de filtro */}
            <div className="galeria-header">
              <h2>Imágenes Guardadas</h2>
              <div className="filtros">
                <button 
                  className={`btn-filtro ${filtroActual === 'todos' ? 'activo' : ''}`}
                  onClick={() => setFiltroActual('todos')}
                >
                  Todas
                </button>
                <button 
                  className={`btn-filtro ${filtroActual === 'cuadro' ? 'activo' : ''}`}
                  onClick={() => setFiltroActual('cuadro')}
                >
                  🖼️ Cuadros
                </button>
                <button 
                  className={`btn-filtro ${filtroActual === 'mesa' ? 'activo' : ''}`}
                  onClick={() => setFiltroActual('mesa')}
                >
                  🪑 Mesas
                </button>
              </div>
            </div>

            <div className="galeria-grid">
              {imagenesFiltradas.length === 0 ? (
                <p className="texto-vacio">No hay imágenes que coincidan con el filtro.</p>
              ) : (
                imagenesFiltradas.map(img => (
                  <div 
                    key={img.id} 
                    className="tarjeta-imagen"
                    draggable 
                    onDragStart={(e) => handleDragStart(e, img)}
                  >
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

      {/* Modal de confirmación de borrado */}
      {imagenAEliminar && (
        <div className="modal-overlay">
          <div className="modal-content modal-alerta">
            <h3>⚠️ Confirmar eliminación</h3>
            {estaEnUso ? (
              <p className="alerta-peligro">
                ¡Cuidado! Esta imagen <strong>se está utilizando en la Sala</strong>. Si la eliminas, desaparecerá de la sala. ¿Estás seguro?
              </p>
            ) : (
              <p>¿Estás seguro de que quieres eliminar esta imagen de tu galería?</p>
            )}
            <div className="imagen-previa-modal">
              <img src={imagenAEliminar.url} alt="Previa" />
            </div>
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