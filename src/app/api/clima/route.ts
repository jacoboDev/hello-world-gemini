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

export async function POST(req: Request) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY!);
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    // 1. Procesar el archivo que llega
    const formData = await req.formData();
    const file = formData.get("cv") as File;
    const buffer = Buffer.from(await file.arrayBuffer());
    const tempPath = path.join("/tmp", file.name);
    fs.writeFileSync(tempPath, buffer);

    // 2. Subir a Google y pedir análisis
    const uploadResult = await fileManager.uploadFile(tempPath, { mimeType: "application/pdf", displayName: "CV" });
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent([
      { fileData: { mimeType: uploadResult.file.mimeType, fileUri: uploadResult.file.uri } },
      { text: "Analiza este CV y devuelve un JSON con: nombre, tecnologias y resumen." },
    ]);

    const datosIA = JSON.parse(result.response.text().replace(/```json|```/g, "").trim());

    // 3. Guardar en la NUEVA tabla (Recuerda crearla en Supabase como te dije antes)
    await supabase.from("cv_analizados").insert([{ datos: datosIA }]);

    // 4. Limpieza
    fs.unlinkSync(tempPath);
    await fileManager.deleteFile(uploadResult.file.name);

    return NextResponse.json({ data: datosIA });
  } catch (err) {
    return NextResponse.json({ error: "Error procesando el archivo" }, { status: 500 });
  }
}
