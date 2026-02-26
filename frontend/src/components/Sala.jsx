import React, { useState } from 'react';

export default function Sala({ cambiarVista, elementos, setElementos, imagenesDisponibles, setImagenes, nombreTematica }) {
  const [muebleActivo, setMuebleActivo] = useState(null);

  const configZonas = elementos.find(el => el.tipo === 'config-zonas') || { id: 'config-zonas', tipo: 'config-zonas', z1: 0, z2: 0, z3: 0, z4: 0, centro: 0 };

  const actualizarConfigZonas = (zona, valor) => {
    let num = parseInt(valor);
    if (isNaN(num) || num < 0) num = 0;
    const nuevaConfig = { ...configZonas, [zona]: num };
    const otrosElementos = elementos.filter(el => el.tipo !== 'config-zonas');
    setElementos([...otrosElementos, nuevaConfig]);
  };

  // Lógica de clic en los huecos (CREAR o EDITAR)
  const manejarClickSlot = (slotId, tipoDefecto) => {
    const muebleExistente = elementos.find(el => el.slotId === slotId);

    if (muebleExistente) {
      setMuebleActivo(muebleExistente.id);
    } else {
      const nuevoId = `${tipoDefecto}-${Date.now()}`;
      const nuevoMueble = { id: nuevoId, tipo: tipoDefecto, x: 250, y: 150, imagen: null, slotId: slotId };
      setElementos(prev => [...prev, nuevoMueble]);
      setMuebleActivo(nuevoId); 
    }
  };

  // --- ACCIONES DE MUEBLES ---
  
  // 1. Borrar el mueble entero (desaparece la mesa/cuadro)
  const borrarMueble = (e, idMueble) => {
    e.stopPropagation(); // Evita que se abra el menú de debajo
    setElementos(elementos.filter(el => el.id !== idMueble));
  };

  // 2. NUEVO: Quitar solo la imagen (la mesa/cuadro se queda vacía)
  const quitarImagenDeMueble = (e, idMueble) => {
    e.stopPropagation();
    setElementos(prev => prev.map(el => el.id === idMueble ? { ...el, imagen: null } : el));
  };

  // 3. Editar el texto flotante
  const editarImagenSala = (e, urlImagen) => {
    e.stopPropagation();
    const img = imagenesDisponibles.find(i => i.url === urlImagen);
    if (img) {
      const nuevaDesc = window.prompt('Editar descripción:', img.descripcion);
      if (nuevaDesc !== null) {
        setImagenes(imagenesDisponibles.map(i => i.url === urlImagen ? { ...i, descripcion: nuevaDesc } : i));
      }
    }
  };

  const asignarImagen = (urlImagen) => {
    setElementos(prev => prev.map(el => el.id === muebleActivo ? { ...el, imagen: urlImagen } : el));
    setMuebleActivo(null); 
  };

  const muebleActual = elementos.find(el => el.id === muebleActivo);
  const imagenesParaMostrar = muebleActual 
    ? imagenesDisponibles.filter(img => img.tipo === (muebleActual.tipo.includes('mesa') ? 'mesa' : 'cuadro')) 
    : [];

  // --- RENDERIZADORES ---
  const renderMueble = (el, enSlot = true) => {
    const imgData = el.imagen ? imagenesDisponibles.find(i => i.url === el.imagen) : null;
    const estiloMueble = enSlot ? { position: 'relative', width: '100%', height: '100%', left: 0, top: 0, border: 'none' } : { left: el.x, top: el.y, position: 'absolute' };

    return (
      <div 
        key={el.id} 
        className={`mueble ${el.tipo} ${enSlot ? 'en-slot' : ''}`} 
        style={estiloMueble} 
        // ¡Drag & Drop ELIMINADO! Solo nos quedamos con el onClick
        onClick={(e) => { e.stopPropagation(); setMuebleActivo(el.id); }} 
      >
        <div className="mueble-acciones">
          {el.imagen && (
            <>
              <button className="btn-icono editar" title="Editar descripción" onClick={(e) => editarImagenSala(e, el.imagen)}>✏️</button>
              <button className="btn-icono borrar" title="Quitar imagen de la mesa" onClick={(e) => quitarImagenDeMueble(e, el.id)}>🧹</button>
            </>
          )}
          <button className="btn-icono borrar" title="Eliminar mesa completa" onClick={(e) => borrarMueble(e, el.id)}>🗑️</button>
        </div>
        
        {el.imagen ? (
          <>
            <img src={el.imagen} alt={imgData?.descripcion || 'contenido'} className="mueble-img" />
            {imgData && <div className="mueble-desc-flotante">{imgData.descripcion}</div>}
          </>
        ) : (
          <span className="mueble-placeholder">Vacío</span>
        )}
      </div>
    );
  };

  const renderPared = (numZona, cantidad) => {
    const slots = [];
    for (let i = 0; i < cantidad; i++) {
      const slotId = `z${numZona}-${i}`;
      const cuadroEnSlot = elementos.find(el => el.slotId === slotId);
      slots.push(
        <div 
          key={slotId} 
          className="slot-pared" 
          onClick={() => manejarClickSlot(slotId, 'cuadro')}
        >
          {cuadroEnSlot ? renderMueble(cuadroEnSlot, true) : <span className="slot-num">{i + 1}</span>}
        </div>
      );
    }
    return slots;
  };

  const renderCentro = (cantidad) => {
    if (cantidad <= 0) return null;
    const slots = [];
    for (let i = 0; i < cantidad; i++) {
      const slotId = `c-${i}`;
      const mesaEnSlot = elementos.find(el => el.slotId === slotId);
      slots.push(
        <div 
          key={slotId} 
          className="slot-centro" 
          onClick={() => manejarClickSlot(slotId, 'mesa-grande')}
        >
          {mesaEnSlot ? renderMueble(mesaEnSlot, true) : <span className="slot-num">Mesa {i + 1}</span>}
        </div>
      );
    }
    
    const columnas = Math.ceil(Math.sqrt(cantidad));
    return (
      <div className="centro-grid" style={{ gridTemplateColumns: `repeat(${columnas}, 1fr)` }}>
        {slots}
      </div>
    );
  };

  return (
    <div className="app-container">
      <aside className="sidebar" style={{ overflowY: 'auto' }}>
        <button className="btn-volver" onClick={() => cambiarVista('calendario')}>📅 Volver al Calendario</button>
        <button className="btn-volver" style={{ marginTop: '10px' }} onClick={() => cambiarVista('gestor')}>🖼️ Volver al Gestor</button>
        
        <hr style={{ margin: '15px 0', border: '1px solid #ddd' }} />
        
        <h3 style={{ fontSize: '14px', color: '#666', textAlign: 'center' }}>
          Temática:<br />
          <span style={{ color: '#2196F3' }}>{nombreTematica}</span>
        </h3>
        
        <hr style={{ margin: '15px 0', border: '1px solid #ddd' }} />
        
        <div className="configuracion-paredes">
          <h4 style={{ fontSize: '14px', marginBottom: '10px' }}>Huecos de la Sala:</h4>
          
          <div className="form-group-mini" style={{ background: '#e3f2fd', padding: '5px', borderRadius: '4px', marginBottom: '15px' }}>
            <label style={{fontWeight: 'bold', color: '#1565c0'}}>Centro (Mesas):</label>
            <input type="number" min="0" max="20" value={configZonas.centro} onChange={e => actualizarConfigZonas('centro', e.target.value)} />
          </div>

          <div className="form-group-mini"><label>Pared 1 (Arriba):</label><input type="number" min="0" max="15" value={configZonas.z1} onChange={e => actualizarConfigZonas('z1', e.target.value)} /></div>
          <div className="form-group-mini"><label>Pared 2 (Derecha):</label><input type="number" min="0" max="15" value={configZonas.z2} onChange={e => actualizarConfigZonas('z2', e.target.value)} /></div>
          <div className="form-group-mini"><label>Pared 3 (Abajo):</label><input type="number" min="0" max="15" value={configZonas.z3} onChange={e => actualizarConfigZonas('z3', e.target.value)} /></div>
          <div className="form-group-mini"><label>Pared 4 (Izquierda):</label><input type="number" min="0" max="15" value={configZonas.z4} onChange={e => actualizarConfigZonas('z4', e.target.value)} /></div>
        </div>
        
        {/* Como el drag and drop desapareció, la sección de añadir muebles libres ya no es necesaria, 
            ya que todo se maneja desde los huecos de arriba de forma inteligente */}
      </aside>

      <main className="area-principal">
        <div className="sala-estructura">
          <div className="pared pared-1"><div className="zona-titulo">ZONA 1</div>{renderPared(1, configZonas.z1)}</div>
          <div className="pared pared-2"><div className="zona-titulo rotado-der">ZONA 2</div>{renderPared(2, configZonas.z2)}</div>
          <div className="pared pared-3"><div className="zona-titulo">ZONA 3</div>{renderPared(3, configZonas.z3)}</div>
          <div className="pared pared-4"><div className="zona-titulo rotado-izq">ZONA 4</div>{renderPared(4, configZonas.z4)}</div>

          <div className="sala-canvas">
            {renderCentro(configZonas.centro)}
            {/* Renderizado de seguridad para muebles antiguos que estuvieran sueltos antes del cambio */}
            {elementos.filter(el => el.tipo !== 'config-zonas' && !el.slotId).map(el => renderMueble(el, false))}
          </div>
        </div>
      </main>

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