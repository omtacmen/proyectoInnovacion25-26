import React, { useState } from 'react';

export default function Sala({ cambiarVista, elementos, setElementos, imagenesDisponibles, nombreTematica }) {
  const [muebleActivo, setMuebleActivo] = useState(null);

  // Funciones de creación
  const agregarMueble = (tipo) => {
    const nuevoId = `${tipo}-${Date.now()}`;
    // Aparecerá por defecto en el centro de la sala
    const nuevoMueble = { id: nuevoId, tipo: tipo, x: 250, y: 150, imagen: null };
    setElementos([...elementos, nuevoMueble]);
  };

  // Drag & Drop
  const handleDragStart = (e, id) => {
    const rect = e.target.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    e.dataTransfer.setData('id', id);
    e.dataTransfer.setData('offsetX', offsetX.toString());
    e.dataTransfer.setData('offsetY', offsetY.toString());
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('id');
    if (!id) return;
    
    const offsetX = parseFloat(e.dataTransfer.getData('offsetX'));
    const offsetY = parseFloat(e.dataTransfer.getData('offsetY'));
    const canvasRect = e.currentTarget.getBoundingClientRect();
    
    const newX = e.clientX - canvasRect.left - offsetX;
    const newY = e.clientY - canvasRect.top - offsetY;
    
    setElementos(prev => prev.map(el => el.id === id ? { ...el, x: newX, y: newY } : el));
  };

  const asignarImagen = (urlImagen) => {
    setElementos(prev => prev.map(el => el.id === muebleActivo ? { ...el, imagen: urlImagen } : el));
    setMuebleActivo(null); // Cierra el modal
  };

  // Lógica para filtrar imágenes según el mueble clickeado
  const obtenerImagenesFiltradas = () => {
    if (!muebleActivo) return [];
    const mueble = elementos.find(el => el.id === muebleActivo);
    const tipoFiltro = mueble.tipo.includes('mesa') ? 'mesa' : 'cuadro';
    return imagenesDisponibles.filter(img => img.tipo === tipoFiltro);
  };

  const imagenesParaMostrar = obtenerImagenesFiltradas();

  return (
    <div className="app-container">
      <aside className="sidebar">
        <button className="btn-volver" onClick={() => cambiarVista('calendario')}>📅 Volver al Calendario</button>
        <button className="btn-volver" style={{marginTop: '10px'}} onClick={() => cambiarVista('gestor')}>🖼️ Volver al Gestor</button>
        <hr style={{margin: '15px 0', border: '1px solid #ddd'}}/>
        <h3 style={{fontSize: '14px', color: '#666', textAlign: 'center'}}>Temática:<br/><span style={{color: '#2196F3'}}>{nombreTematica}</span></h3>
        <hr style={{margin: '15px 0', border: '1px solid #ddd'}}/>
        
        <h2>Controles</h2>
        <div className="botones-creacion">
          <button className="btn-add" onClick={() => agregarMueble('cuadro')}>+ Añadir Cuadro</button>
          <button className="btn-add" onClick={() => agregarMueble('mesa-grande')}>+ Añadir Mesa Grande</button>
          <button className="btn-add" onClick={() => agregarMueble('mesa-pequena')}>+ Añadir Mesa Pequeña</button>
        </div>
      </aside>

      <main className="area-principal">
        <div className="sala-estructura">
          <div className="zona zona-1">ZONA 1</div>
          <div className="zona zona-2">ZONA 2</div>
          <div className="zona zona-3">ZONA 3</div>
          <div className="zona zona-4">ZONA 4</div>

          <div className="sala-canvas" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
            {elementos.map(el => (
              <div
                key={el.id} 
                className={`mueble ${el.tipo}`} 
                style={{ left: el.x, top: el.y }}
                draggable 
                onDragStart={(e) => handleDragStart(e, el.id)} 
                onClick={() => setMuebleActivo(el.id)}
              >
                {el.imagen ? (
                  <img src={el.imagen} alt="contenido" className="mueble-img" />
                ) : (
                  <span className="mueble-placeholder">Vacío</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* SUBMENÚ DINÁMICO */}
      {muebleActivo && (
        <div className="modal-overlay" onClick={() => setMuebleActivo(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Elige una imagen</h3>
            <div className="galeria-imagenes">
              {imagenesParaMostrar.length === 0 ? (
                <p>No hay imágenes guardadas para este tipo de mueble.</p>
              ) : (
                imagenesParaMostrar.map((img) => (
                  <div key={img.id} className="opcion-contenedor" onClick={() => asignarImagen(img.url)}>
                    <img src={img.url} alt={img.descripcion} className="opcion-img" title={img.descripcion} />
                    {/* ¡NUEVO! Añadimos la descripción debajo de la imagen */}
                    <span className="opcion-desc">{img.descripcion || 'Sin descripción'}</span>
                  </div>
                ))
              )}
            </div>
            <button className="btn-cerrar" onClick={() => setMuebleActivo(null)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}