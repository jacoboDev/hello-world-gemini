import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

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
    const result = await model.generateContent(prompt);
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