'use client';

import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [respuesta, setRespuesta] = useState(''); // VARIABLE PARA LA RESPUESTA

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

      {/* AQUÍ MOSTRAMOS LA RESPUESTA */}
      {respuesta && (
        <div style={{ 
          marginTop: '20px', 
          padding: '20px', 
          border: '1px solid #ddd', 
          borderRadius: '8px',
          backgroundColor: '#f9f9f9' 
        }}>
          <h3>Respuesta de la IA:</h3>
          <p>{respuesta}</p>
          <small style={{ color: '#666' }}>✨ Datos guardados en Supabase</small>
        </div>
      )}
    </main>
  );
}