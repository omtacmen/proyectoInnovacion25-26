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

  const agregarMueble = (tipo) => {
    const nuevoId = `${tipo}-${Date.now()}`;
    const nuevoMueble = { id: nuevoId, tipo: tipo, x: 250, y: 150, imagen: null, slotId: null };
    setElementos([...elementos, nuevoMueble]);
  };

  // --- ¡NUEVO! LÓGICA DE CLIC EN LOS HUECOS ---
  const manejarClickSlot = (slotId, tipoDefecto) => {
    // Buscamos si ya hay un mueble en este hueco
    const muebleExistente = elementos.find(el => el.slotId === slotId);

    if (muebleExistente) {
      // Si ya hay uno, abrimos el modal para cambiar su foto
      setMuebleActivo(muebleExistente.id);
    } else {
      // Si el hueco está vacío, CREAMOS el mueble automáticamente y abrimos el modal
      const nuevoId = `${tipoDefecto}-${Date.now()}`;
      const nuevoMueble = { id: nuevoId, tipo: tipoDefecto, x: 250, y: 150, imagen: null, slotId: slotId };
      
      setElementos(prev => [...prev, nuevoMueble]);
      setMuebleActivo(nuevoId); // Activa el modal al instante
    }
  };

  // --- LÓGICA DE DRAG & DROP ---
  const handleDragStart = (e, id) => {
    const rect = e.target.getBoundingClientRect();
    e.dataTransfer.setData('id', id);
    e.dataTransfer.setData('offsetX', e.clientX - rect.left);
    e.dataTransfer.setData('offsetY', e.clientY - rect.top);
  };

  const handleDropCanvas = (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('id');
    if (!id) return;
    
    const offsetX = parseFloat(e.dataTransfer.getData('offsetX'));
    const offsetY = parseFloat(e.dataTransfer.getData('offsetY'));
    const rect = e.currentTarget.getBoundingClientRect();
    const newX = e.clientX - rect.left - offsetX;
    const newY = e.clientY - rect.top - offsetY;
    
    setElementos(prev => prev.map(el => el.id === id ? { ...el, x: newX, y: newY, slotId: null } : el));
  };

  const handleDropSlot = (e, slotId) => {
    e.preventDefault();
    e.stopPropagation(); 
    const id = e.dataTransfer.getData('id');
    if (!id) return;

    const mueble = elementos.find(el => el.id === id);
    const esSlotPared = slotId.startsWith('z');
    const esSlotCentro = slotId.startsWith('c');

    if (esSlotPared && !mueble.tipo.includes('cuadro')) {
      alert("⚠️ Solo puedes colgar cuadros en las paredes."); return;
    }
    if (esSlotCentro && !mueble.tipo.includes('mesa')) {
      alert("⚠️ Solo puedes poner mesas en las cuadrículas del centro."); return;
    }

    setElementos(prev => prev.map(el => {
      if (el.slotId === slotId) return { ...el, slotId: null, x: 250, y: 150 }; 
      if (el.id === id) return { ...el, slotId: slotId }; 
      return el;
    }));
  };

  // --- ACCIONES DE MUEBLES (Editar/Borrar) ---
  const borrarMueble = (e, idMueble) => {
    e.stopPropagation();
    setElementos(elementos.filter(el => el.id !== idMueble));
  };

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

  // Prevenimos fallos si muebleActivo aún no está en el array durante el ciclo de renderizado rápido
  const muebleActual = elementos.find(el => el.id === muebleActivo);
  const imagenesParaMostrar = muebleActual 
    ? imagenesDisponibles.filter(img => img.tipo === (muebleActual.tipo.includes('mesa') ? 'mesa' : 'cuadro')) 
    : [];

  // --- RENDERIZADORES ---
  // --- RENDERIZADORES ---
  const renderMueble = (el, enSlot = false) => {
    const imgData = el.imagen ? imagenesDisponibles.find(i => i.url === el.imagen) : null;
    const estiloMueble = enSlot ? { position: 'relative', width: '100%', height: '100%', left: 0, top: 0, border: 'none' } : { left: el.x, top: el.y };

    return (
      <div 
        key={el.id} 
        className={`mueble ${el.tipo} ${enSlot ? 'en-slot' : ''}`} 
        style={estiloMueble} 
        draggable 
        onDragStart={(e) => handleDragStart(e, el.id)} 
        onClick={(e) => { e.stopPropagation(); setMuebleActivo(el.id); }}
      >
        <div className="mueble-acciones">
          {el.imagen && <button className="btn-icono editar" title="Editar descripción" onClick={(e) => editarImagenSala(e, el.imagen)}>✏️</button>}
          <button className="btn-icono borrar" title="Quitar" onClick={(e) => borrarMueble(e, el.id)}>🗑️</button>
        </div>
        
        {el.imagen ? (
          <>
            {/* Le añadimos la etiqueta title nativa por si acaso, y quitamos el !enSlot del div */}
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
          onDragOver={e => e.preventDefault()} 
          onDrop={e => handleDropSlot(e, slotId)}
          onClick={() => manejarClickSlot(slotId, 'cuadro')} // Hacemos el hueco clicable
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
          onDragOver={e => e.preventDefault()} 
          onDrop={e => handleDropSlot(e, slotId)}
          onClick={() => manejarClickSlot(slotId, 'mesa-grande')} // Hacemos el hueco clicable
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

        <hr style={{ margin: '15px 0', border: '1px solid #ddd' }} />
        
        <h2>Mobiliario Libre</h2>
        <div className="botones-creacion">
          <button className="btn-add" onClick={() => agregarMueble('cuadro')}>+ Añadir Cuadro</button>
          <button className="btn-add" onClick={() => agregarMueble('mesa-grande')}>+ Añadir Mesa Grande</button>
          <button className="btn-add" onClick={() => agregarMueble('mesa-pequena')}>+ Añadir Mesa Pequeña</button>
        </div>
      </aside>

      <main className="area-principal">
        <div className="sala-estructura">
          <div className="pared pared-1"><div className="zona-titulo">ZONA 1</div>{renderPared(1, configZonas.z1)}</div>
          <div className="pared pared-2"><div className="zona-titulo rotado-der">ZONA 2</div>{renderPared(2, configZonas.z2)}</div>
          <div className="pared pared-3"><div className="zona-titulo">ZONA 3</div>{renderPared(3, configZonas.z3)}</div>
          <div className="pared pared-4"><div className="zona-titulo rotado-izq">ZONA 4</div>{renderPared(4, configZonas.z4)}</div>

          <div className="sala-canvas" onDragOver={(e) => e.preventDefault()} onDrop={handleDropCanvas}>
            {renderCentro(configZonas.centro)}
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