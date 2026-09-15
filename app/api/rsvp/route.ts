import { getDb } from "@/db";
import { rsvps } from "@/db/schema";

type RsvpPayload = { name?: string; attendance?: string; guests?: number; message?: string; website?: string };

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RsvpPayload;
    const name = payload.name?.trim() ?? "";
    const attendance = payload.attendance === "no" ? "no" : "yes";
    const guests = attendance === "no" ? 0 : Math.min(6, Math.max(1, Number(payload.guests) || 1));
    const message = payload.message?.trim().slice(0, 500) ?? "";
    if (payload.website) return Response.json({ ok: true }, { status: 201 });
    if (name.length < 2 || name.length > 100) return Response.json({ error: "Escribe un nombre válido." }, { status: 400 });
    const db = getDb();
    await db.insert(rsvps).values({ name, attendance, guests, message });
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("RSVP save failed", error);
    return Response.json({ error: "No se pudo guardar la confirmación." }, { status: 500 });
  }
}
