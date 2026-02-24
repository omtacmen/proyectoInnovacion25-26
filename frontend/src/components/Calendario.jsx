import React, { useState } from 'react';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function Calendario({ tematicas, setTematicas, abrirTematica, guardarEnMongo, borrarTematicaApp }) {
  const [añoActual, setAñoActual] = useState(new Date().getFullYear());

  const crearTematica = (mesIndex) => {
    const nombre = window.prompt(`Añadir temática para ${MESES[mesIndex]} ${añoActual}:\n(Ej: Política Canaria)`);
    if (!nombre || nombre.trim() === '') return;

    const nuevaTematica = {
      id: `tematica-${Date.now()}`,
      nombre: nombre,
      año: añoActual,
      mes: mesIndex,
      imagenes: [],     
      elementosSala: [] 
    };
    
    setTematicas([...tematicas, nuevaTematica]);
    guardarEnMongo(nuevaTematica); // Guarda en MongoDB
  };

  const editarTematica = (e, idActual) => {
    e.stopPropagation(); 
    const tematica = tematicas.find(t => t.id === idActual);
    const nuevoNombre = window.prompt('Editar nombre de la temática:', tematica.nombre);
    
    if (nuevoNombre && nuevoNombre.trim() !== '') {
      const tematicaEditada = { ...tematica, nombre: nuevoNombre };
      setTematicas(prev => prev.map(t => t.id === idActual ? tematicaEditada : t));
      guardarEnMongo(tematicaEditada); // Guarda edición en MongoDB
    }
  };

  const borrarTematica = (e, idActual) => {
    e.stopPropagation(); 
    const confirmacion = window.confirm('¿Seguro que quieres eliminar esta temática y sus imágenes?');
    if (confirmacion) {
      borrarTematicaApp(idActual); // Llama a la función de App.jsx que borra en MongoDB
    }
  };

  return (
    <div className="calendario-container">
      <header className="calendario-header">
        <h1>📅 Calendario de Temáticas</h1>
        <div className="selector-año">
          <button onClick={() => setAñoActual(añoActual - 1)}>◀</button>
          <h2>AÑO {añoActual}</h2>
          <button onClick={() => setAñoActual(añoActual + 1)}>▶</button>
        </div>
      </header>

      <div className="kanban-grid">
        {MESES.map((nombreMes, indexMes) => {
          const tematicasMes = tematicas.filter(t => t.año === añoActual && t.mes === indexMes);

          return (
            <div key={nombreMes} className="mes-columna">
              <div className="mes-cabecera">{nombreMes}</div>
              
              <div className="mes-contenido">
                {tematicasMes.map(tematica => (
                  <div key={tematica.id} className="tarjeta-tematica" onClick={() => abrirTematica(tematica)}>
                    <div className="tarjeta-tematica-header">
                      <h4>{tematica.nombre}</h4>
                      <div className="tarjeta-acciones">
                        <button className="btn-icono editar" title="Editar" onClick={(e) => editarTematica(e, tematica.id)}>✏️</button>
                        <button className="btn-icono borrar" title="Borrar" onClick={(e) => borrarTematica(e, tematica.id)}>🗑️</button>
                      </div>
                    </div>
                    <span className="badge">{tematica.imagenes.length} imgs | {tematica.elementosSala.length} muebles</span>
                  </div>
                ))}
              </div>

              <button className="btn-add-tematica" onClick={() => crearTematica(indexMes)}>+ Añadir Temática</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}