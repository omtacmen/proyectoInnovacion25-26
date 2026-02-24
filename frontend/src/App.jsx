import React, { useState, useEffect } from 'react';
import './App.css';
import GestorImagenes from './components/GestorImagenes';
import Sala from './components/Sala';
import Calendario from './components/Calendario';

export default function App() {
  const [vistaActual, setVistaActual] = useState('calendario'); 
  const [tematicas, setTematicas] = useState([]);
  const [tematicaActivaId, setTematicaActivaId] = useState(null);
  
  const [imagenesTrabajo, setImagenesTrabajo] = useState([]);
  const [elementosSalaTrabajo, setElementosSalaTrabajo] = useState([]);

  const [dbCargada, setDbCargada] = useState(false);

  // 1. CARGAR DATOS DESDE MONGODB AL INICIAR
  useEffect(() => {
    fetch('http://localhost:5005/api/tematicas')
      .then(res => res.json())
      .then(data => {
        // Aseguramos que el id coincida con el frontend
        const tematicasCargadas = data.map(t => ({ ...t, id: t.id_frontend || t.id }));
        setTematicas(tematicasCargadas);
        setDbCargada(true);
      })
      .catch(err => console.error("Error al cargar MongoDB:", err));
  }, []);

  // Función genérica para guardar una temática en MongoDB
  const guardarEnMongo = async (tematicaActualizada) => {
    try {
      await fetch('http://localhost:5005/api/tematicas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...tematicaActualizada, id_frontend: tematicaActualizada.id })
      });
    } catch (error) {
      console.error("Error guardando en BD:", error);
    }
  };

  const abrirTematica = (tematica) => {
    setTematicaActivaId(tematica.id);
    setImagenesTrabajo(tematica.imagenes || []);
    setElementosSalaTrabajo(tematica.elementosSala || []);
    setVistaActual('gestor'); 
  };

  // Guardado Automático de Imágenes
  const sincronizarImagenes = (nuevasImagenes) => {
    setImagenesTrabajo(nuevasImagenes);
    setTematicas(prev => prev.map(t => {
      if (t.id === tematicaActivaId) {
        const tActualizada = { ...t, imagenes: nuevasImagenes };
        guardarEnMongo(tActualizada); // Sube los cambios a MongoDB
        return tActualizada;
      }
      return t;
    }));
  };

  // Guardado Automático de la Sala
  const sincronizarElementosSala = (nuevosElementos) => {
    setElementosSalaTrabajo(nuevosElementos);
    setTematicas(prev => prev.map(t => {
      if (t.id === tematicaActivaId) {
        const tActualizada = { ...t, elementosSala: nuevosElementos };
        guardarEnMongo(tActualizada); // Sube los cambios a MongoDB
        return tActualizada;
      }
      return t;
    }));
  };

  // Función para borrar de MongoDB
  const borrarTematicaApp = async (idActual) => {
    setTematicas(prev => prev.filter(t => t.id !== idActual));
    try {
      await fetch(`http://localhost:5005/api/tematicas/${idActual}`, { method: 'DELETE' });
    } catch (error) { console.error("Error borrando de BD:", error); }
  };

  const nombreTematicaActiva = tematicas.find(t => t.id === tematicaActivaId)?.nombre || '';

  if (!dbCargada) return <div style={{padding: '50px', textAlign: 'center'}}>Conectando con MongoDB local...</div>;

  return (
    <>
      {vistaActual === 'calendario' && (
        <Calendario 
          tematicas={tematicas} 
          setTematicas={setTematicas} 
          abrirTematica={abrirTematica} 
          guardarEnMongo={guardarEnMongo}
          borrarTematicaApp={borrarTematicaApp}
        />
      )}
      {vistaActual === 'gestor' && (
        <GestorImagenes 
          cambiarVista={(vista) => setVistaActual(vista)} 
          imagenes={imagenesTrabajo} setImagenes={sincronizarImagenes}
          elementosSala={elementosSalaTrabajo} setElementosSala={sincronizarElementosSala}
          nombreTematica={nombreTematicaActiva}
        />
      )}
      {vistaActual === 'sala' && (
        <Sala 
          cambiarVista={(vista) => setVistaActual(vista)} 
          elementos={elementosSalaTrabajo} 
          setElementos={sincronizarElementosSala}
          imagenesDisponibles={imagenesTrabajo} 
          setImagenes={sincronizarImagenes} /* ¡AÑADIR ESTA LÍNEA! */
          nombreTematica={nombreTematicaActiva}
        />
      )}
    </>
  );
}