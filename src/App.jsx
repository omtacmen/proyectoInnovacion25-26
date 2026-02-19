import React, { useState } from 'react';
import './App.css';
import GestorImagenes from './components/GestorImagenes';
import Sala from './components/Sala';
import Calendario from './components/Calendario'; // ¡Importamos el calendario!

export default function App() {
  // 'calendario' | 'gestor' | 'sala'
  const [vistaActual, setVistaActual] = useState('calendario'); 
  
  // Base de datos principal de todas las temáticas
  const [tematicas, setTematicas] = useState([]);
  const [tematicaActivaId, setTematicaActivaId] = useState(null);

  // Espacio de trabajo temporal para la temática activa
  const [imagenesTrabajo, setImagenesTrabajo] = useState([]);
  const [elementosSalaTrabajo, setElementosSalaTrabajo] = useState([]);

  // Al hacer clic en una temática del calendario
  const abrirTematica = (tematica) => {
    setTematicaActivaId(tematica.id);
    setImagenesTrabajo(tematica.imagenes || []);
    setElementosSalaTrabajo(tematica.elementosSala || []);
    setVistaActual('gestor'); // Llevamos al usuario al gestor al abrir
  };

  // Funciones de guardado automático: 
  // Cuando modificas algo en Gestor o Sala, se guarda en el espacio de trabajo Y en la temática.
  const sincronizarImagenes = (nuevasImagenes) => {
    setImagenesTrabajo(nuevasImagenes);
    setTematicas(prev => prev.map(t => t.id === tematicaActivaId ? { ...t, imagenes: nuevasImagenes } : t));
  };

  const sincronizarElementosSala = (nuevosElementos) => {
    setElementosSalaTrabajo(nuevosElementos);
    setTematicas(prev => prev.map(t => t.id === tematicaActivaId ? { ...t, elementosSala: nuevosElementos } : t));
  };

  // Buscamos el nombre de la temática activa para mostrarlo en el título
  const nombreTematicaActiva = tematicas.find(t => t.id === tematicaActivaId)?.nombre || '';

  return (
    <>
      {vistaActual === 'calendario' && (
        <Calendario 
          tematicas={tematicas} 
          setTematicas={setTematicas} 
          abrirTematica={abrirTematica} 
        />
      )}

      {vistaActual === 'gestor' && (
        <GestorImagenes 
          cambiarVista={(vista) => setVistaActual(vista)} // Ahora le pasamos a dónde queremos ir ('sala' o 'calendario')
          imagenes={imagenesTrabajo}
          setImagenes={sincronizarImagenes}
          elementosSala={elementosSalaTrabajo}
          setElementosSala={sincronizarElementosSala}
          nombreTematica={nombreTematicaActiva}
        />
      )}

      {vistaActual === 'sala' && (
        <Sala 
          cambiarVista={(vista) => setVistaActual(vista)} 
          elementos={elementosSalaTrabajo}
          setElementos={sincronizarElementosSala}
          imagenesDisponibles={imagenesTrabajo}
          nombreTematica={nombreTematicaActiva}
        />
      )}
    </>
  );
}