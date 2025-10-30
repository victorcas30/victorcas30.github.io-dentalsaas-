export async function GET() {
  return Response.json({ 
    mensaje: "¡Hola desde mi API!",
    fecha: new Date().toISOString()
  });
}