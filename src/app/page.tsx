'use client';

import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [respuesta, setRespuesta] = useState(''); // VARIABLE PARA LA RESPUESTA
  
  // Estados para los archivos de cada motor
  const [archivoNode, setArchivoNode] = useState<File | null>(null);
  const [archivoPython, setArchivoPython] = useState<File | null>(null);

  // Guardaremos qué motor está analizando
  const [analizando, setAnalizando] = useState<'node' | 'python' | null>(null);

  const consultarClima = async () => {
    setLoading(true);
    setRespuesta(''); // Limpiar respuesta anterior
    try {
      const res = await fetch('/api/clima');
      const data = await res.json();
      
      // Guardamos la respuesta que viene de la IA en el estado
      setRespuesta(data.data); 
    } catch (error) {
      setRespuesta("Error al conectar con la API");
    } finally {
      setLoading(false);
    }
  };

  // Función para node.js 
  const analizarCV = async () => {
    if (!archivoNode) return alert("Selecciona un PDF");
    setAnalizando('node');
    const formData = new FormData();
    formData.append('cv', archivoNode);

    try {
      const res = await fetch('/api/clima?engine=node', { method: 'POST', body: formData });
      const data = await res.json();
      setRespuesta(data.data); // Guardamos el objeto directamente
    } catch (error) {
      setRespuesta("Error al analizar el PDF en Node");
    } finally {
      setAnalizando(null);
    }
  };

  // Función para Python
  const analizarConPython = async () => {
    if (!archivoPython) return alert("Selecciona un PDF");
    setAnalizando('python');

    const formData = new FormData();
    formData.append('cv', archivoPython);

    try {
      // Ahora llamamos a NUESTRO api/clima pero con ?engine=python
      const res = await fetch('/api/clima?engine=python', { 
        method: 'POST', 
        body: formData 
      });
      
      const result = await res.json();
      setRespuesta(result.data);

    } catch (error) {
      setRespuesta("Error conectando con el motor de Python");

    } finally {
      setAnalizando(null);
    }
  };

  return (
    <main style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🌤️ Gemini Clima Logger</h1>
      
      <button 
        onClick={consultarClima}
        disabled={loading}
        style={{
          padding: '12px 24px',
          backgroundColor: loading ? '#ccc' : '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        {loading ? 'Consultando a Gemini...' : '¡Consultar ahora!'}
      </button>

      {/* CONTENEDOR PRINCIPAL DE LAS DOS CAJAS */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
        
        {/* CAJA NODE.JS */}
        <div style={{ flex: 1, padding: '20px', border: '2px solid #0070f3', borderRadius: '10px' }}>
          <h3>🟢 Backend: Node.js</h3>
          <input type="file" accept="application/pdf" onChange={(e) => setArchivoNode(e.target.files?.[0] || null)} />
          <button 
            onClick={analizarCV} 
            disabled={analizando !== null} // Deshabilitamos si ya estamos analizando algo
            style={{ marginTop: '10px', width: '100%', backgroundColor: '#0070f3', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer' }}
          >
            {analizando === 'node' ? 'Procesando en Node...' : 'Subir vía Node'}
          </button>
        </div>

        {/* CAJA PYTHON */}
        <div style={{ flex: 1, padding: '20px', border: '2px solid #3776ab', borderRadius: '10px' }}>
          <h3>🔵 Backend: Python (FastAPI)</h3>
          <input type="file" accept="application/pdf" onChange={(e) => setArchivoPython(e.target.files?.[0] || null)}/>
          <button 
            onClick={analizarConPython}
            disabled={analizando !== null} // Deshabilitamos si ya estamos analizando algo
            style={{ marginTop: '10px', width: '100%', backgroundColor: '#3776ab', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer' }}
          >
            {analizando === 'python' ? 'Procesando en Python...' : 'Subir vía Python'}
          </button>
        </div>
      </div>

      {/* AQUÍ MOSTRAMOS LA RESPUESTA */}
      {respuesta && (
        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h3>Resultado del Análisis:</h3>
          <pre style={{ backgroundColor: '#eee', padding: '10px', overflowX: 'auto' }}>
            {JSON.stringify(respuesta, null, 2)}
          </pre>
          <small style={{ color: '#666' }}>✨ Datos guardados en Supabase</small>
        </div>
      )}


    </main>
  );
}