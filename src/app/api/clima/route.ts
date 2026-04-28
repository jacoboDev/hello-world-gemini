import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // 1. Configuración de Clientes
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 2. Pedir a Gemini el tiempo en Barcelona
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = "Dime el clima actual en Barcelona de forma muy breve.";
    const result = await generarConReintento(model, prompt);
    const response = await result.response;
    const respuestaIA = response.text();

    // 3. Guardar en Supabase
    const { data, error } = await supabase
      .from("consultas_clima")
      .insert([
        {
          ciudad: "Barcelona",
          respuesta_generada: respuestaIA,
          fecha: new Date().toISOString()
        },
      ]);

    if (error) throw error;

    return NextResponse.json({ mensaje: "Guardado correctamente", data: respuestaIA });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error en el proceso" }, { status: 500 });
  }
}

// Función RETRY con EXPONENTIAL BACKOFF (cada vez esperas el doble de largas) cuando Gemini falla por tráfico
// con CAP de 8 segundos (tiempo máximo en el Exponential)
// Función para reintentar si Google está ocupado
async function generarConReintento(model, contenido, maxIntentos = 6) {
  let espera = 2000; // Empezamos en 2 segundos

  for (let i = 0; i < maxIntentos; i++) {
    try {
      return await model.generateContent(contenido);
    } catch (err) {
      // Si es error de saturación y NO es el último intento...
      if ((err.status === 503 || err.status === 429) && i < maxIntentos - 1) {

        // El "jitter" añade entre 0 y 1 segundo al azar
        const jitter = Math.random() * 1000;
        const tiempoTotal = espera + jitter;

        // Ponemos Math.floor para que el log nos diga el número redondo
        console.log(`Intento ${i + 1} fallido. Reintentando en ${Math.floor(tiempoTotal / 1000)} seg...`);

        await new Promise(resolve => setTimeout(resolve, tiempoTotal));

        // Tiempo máximo de espera en milisegundos (límite para el Exponential Backoff)
        if (espera < 8000) {
          espera *= 2;
        }

        continue;
      }
      // Si el error es otra cosa (ej: clave API mal), no reintentes, falla ya.
      throw err;
    }
  }
}





// Sustituye tus dos POST por este único bloque
export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const engine = searchParams.get("engine"); // Capturamos ?engine=python o ?engine=node
    const formData = await req.formData();
    let datosIA;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (engine === "python") {
      // --- LÓGICA PUENTE HACIA PYTHON ---
      const pythonRes = await fetch("http://python_app:8000/analizar", {
        method: "POST",
        body: formData,
      });
      const pythonData = await pythonRes.json();
      if (pythonData.error) throw new Error(pythonData.error);

      // Limpiamos el texto que devuelve Python (Gemini suele poner markdown)
      const textoLimpio = pythonData.data.replace(/```json|```/g, "").trim();
      datosIA = JSON.parse(textoLimpio);
    } else {
      // --- LÓGICA NATIVA NODE ---
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY!);
      const file = formData.get("cv") as File;
      const buffer = Buffer.from(await file.arrayBuffer());
      const tempPath = path.join("/tmp", file.name);

      fs.writeFileSync(tempPath, buffer);
      const uploadResult = await fileManager.uploadFile(tempPath, { mimeType: "application/pdf", displayName: "CV" });
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const result = await generarConReintento(model, [
        { fileData: { mimeType: uploadResult.file.mimeType, fileUri: uploadResult.file.uri } },
        { text: "Analiza este CV y devuelve un JSON con: nombre, tecnologias y resumen." },
      ]);

      datosIA = JSON.parse(result.response.text().replace(/```json|```/g, "").trim());

      fs.unlinkSync(tempPath); // Limpiar temporal
    }

    // --- GUARDADO COMÚN EN SUPABASE ---
    await supabase.from("cv_analizados").insert([
      { datos: datosIA, lenguaje: engine === "python" ? "Python" : "Node.js" }
    ]);

    return NextResponse.json({ data: datosIA });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}