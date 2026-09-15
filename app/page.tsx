"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { CalendarDays, Check, ChevronDown, Gift, MapPin, Music2, Pause, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

const EVENT_DATE = new Date("2026-12-18T14:00:00-06:00");
const MUSIC_READY = false;
const ceremonyMap = "https://www.google.com/maps/search/?api=1&query=3030+Gus+Thomasson+Rd+Dallas+TX+75228";
const receptionMap = "https://www.google.com/maps/search/?api=1&query=Hawn+Event+Center+13953+C+F+Hawn+Freeway+Dallas+TX+75253";

type ModelContextDocument = Document & {
  modelContext?: {
    registerTool: (tool: {
      name: string;
      title: string;
      description: string;
      inputSchema: object;
      annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
      execute: (input: unknown) => Promise<unknown>;
    }, options?: { signal: AbortSignal }) => void | Promise<void>;
  };
};

function useCountdown() {
  const [remaining, setRemaining] = useState(() => EVENT_DATE.getTime() - Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(EVENT_DATE.getTime() - Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const context = (document as ModelContextDocument).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({
      name: "submit_rsvp",
      title: "Confirmar asistencia",
      description: "Registra si una persona asistirá al Sweet Sixteen de Jordanka y cuántas personas incluye su confirmación.",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 2, maxLength: 100 },
          attendance: { type: "string", enum: ["yes", "no"] },
          guests: { type: "integer", minimum: 1, maximum: 6 },
          message: { type: "string", maxLength: 500 },
        },
        required: ["name", "attendance"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      async execute(input) {
        const value = input as { name?: unknown; attendance?: unknown; guests?: unknown; message?: unknown };
        if (typeof value.name !== "string" || value.name.trim().length < 2) throw new Error("Se requiere un nombre válido.");
        if (value.attendance !== "yes" && value.attendance !== "no") throw new Error("La asistencia debe ser yes o no.");
        const guests = value.attendance === "no" ? 0 : Number(value.guests ?? 1);
        if (value.attendance === "yes" && (!Number.isInteger(guests) || guests < 1 || guests > 6)) throw new Error("La cantidad de personas debe estar entre 1 y 6.");
        const response = await fetch("/api/rsvp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: value.name, attendance: value.attendance, guests, message: typeof value.message === "string" ? value.message : "" }),
        });
        if (!response.ok) throw new Error("No se pudo registrar la confirmación.");
        setAttendance(value.attendance);
        setStatus("success");
        document.querySelector("#rsvp")?.scrollIntoView({ behavior: "smooth" });
        return { registered: true, attendance: value.attendance, guests };
      },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);
  const value = Math.max(0, remaining);
  return {
    días: Math.floor(value / 86_400_000),
    horas: Math.floor((value / 3_600_000) % 24),
    minutos: Math.floor((value / 60_000) % 60),
    segundos: Math.floor((value / 1000) % 60),
  };
}

export default function Home() {
  const [entered, setEntered] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [attendance, setAttendance] = useState("yes");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const audioRef = useRef<HTMLAudioElement>(null);
  const countdown = useCountdown();

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.dataset.visible = "true";
      });
    }, { threshold: 0.16 });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  async function enterInvitation() {
    setEntered(true);
    if (MUSIC_READY && audioRef.current) {
      try {
        await audioRef.current.play();
        setMusicPlaying(true);
      } catch {
        setMusicPlaying(false);
      }
    }
  }

  async function toggleMusic() {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      await audioRef.current.play();
      setMusicPlaying(true);
    } else {
      audioRef.current.pause();
      setMusicPlaying(false);
    }
  }

  async function submitRsvp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      attendance,
      guests: Number(form.get("guests") ?? 1),
      message: String(form.get("message") ?? ""),
      website: String(form.get("website") ?? ""),
    };
    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("No se pudo guardar");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="invitation-shell">
      <audio ref={audioRef} src={MUSIC_READY ? "/song.mp3" : undefined} loop preload="none" />

      <div className={`entrance ${entered ? "entrance--open" : ""}`} aria-hidden={entered}>
        <div className="entrance__halo" />
        <p className="eyebrow entrance__eyebrow">Una celebración extraordinaria</p>
        <button className="seal" onClick={enterInvitation} aria-label="Abrir invitación de Jordanka">
          <span className="seal__initials">J·A·H</span><span className="seal__orbit" />
        </button>
        <h1 className="entrance__name">Jordanka</h1>
        <p className="entrance__hint">Toca el sello para entrar</p>
      </div>

      {MUSIC_READY && entered && (
        <button className="music-control" onClick={toggleMusic} aria-label={musicPlaying ? "Pausar música" : "Reproducir música"}>
          {musicPlaying ? <Pause /> : <Music2 />}<span>{musicPlaying ? "Pausar" : "Música"}</span>
        </button>
      )}

      <section className="hero" aria-label="Invitación principal">
        <img src="/jordanka-portrait.webp" alt="Jordanka junto a su caballo adornado con flores" className="hero__image" />
        <div className="hero__veil" />
        <div className="hero__monogram" aria-hidden="true">16</div>
        <div className="hero__content">
          <p className="eyebrow">Sweet Sixteen · 18.12.2026</p>
          <h2><span>Jordanka</span><span>Hernández</span></h2>
          <p className="hero__line">Una tarde para florecer. Una noche para recordar.</p>
        </div>
        <a href="#historia" className="scroll-cue" aria-label="Descubrir la invitación"><span>Descubre</span><ChevronDown /></a>
      </section>

      <section id="historia" className="chapter chapter--ivory">
        <div className="chapter__number" aria-hidden="true">I</div>
        <div className="story-copy" data-reveal>
          <Sparkles className="story-copy__spark" />
          <p className="eyebrow">Con mucha ilusión</p>
          <h2>Hay momentos que merecen convertirse en historia.</h2>
          <p>Acompáñanos a celebrar los dieciséis años de Jordanka: una fecha que marca nuevos sueños, nuevas aventuras y recuerdos que viviremos juntos.</p>
          <div className="signature">Jordanka</div>
        </div>
      </section>

      <section className="portrait-break portrait-break--first">
        <img src="/jordanka-hat.webp" alt="Retrato de Jordanka con vestido rosa y sombrero blanco" loading="lazy" />
        <div className="portrait-break__quote" data-reveal><span>Sixteen</span><strong>looks good on her.</strong></div>
      </section>

      <section className="date-stage">
        <div className="date-stage__orb date-stage__orb--one" /><div className="date-stage__orb date-stage__orb--two" />
        <div className="date-card" data-reveal>
          <p className="eyebrow">Reserva la fecha</p>
          <div className="date-lockup"><span>DIC</span><strong>18</strong><span>2026</span></div>
          <p className="date-card__day">Viernes · Dallas, Texas</p>
          <div className="countdown" aria-label="Cuenta regresiva">
            {Object.entries(countdown).map(([label, value]) => <div key={label}><strong>{String(value).padStart(2, "0")}</strong><span>{label}</span></div>)}
          </div>
          <a className="calendar-link" href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Sweet+Sixteen+de+Jordanka&dates=20261218T200000Z/20261219T040000Z&details=Acomp%C3%A1%C3%B1anos+a+celebrar+los+16+de+Jordanka&location=Dallas%2C+Texas" target="_blank" rel="noreferrer"><CalendarDays /> Agregar al calendario</a>
        </div>
      </section>

      <section className="events chapter chapter--rose">
        <div className="chapter__number" aria-hidden="true">II</div>
        <header data-reveal><p className="eyebrow">El recorrido</p><h2>Dos momentos.<br />Una misma celebración.</h2></header>
        <div className="event-list">
          <article className="event-card" data-reveal>
            <span className="event-card__index">01</span><p className="eyebrow">Misa</p><h3>2:00 p. m.</h3>
            <p>3030 Gus Thomasson Rd<br />Dallas, TX 75228</p>
            <a href={ceremonyMap} target="_blank" rel="noreferrer"><MapPin /> Cómo llegar</a>
          </article>
          <article className="event-card event-card--dark" data-reveal>
            <span className="event-card__index">02</span><p className="eyebrow">Celebración</p><h3>Hawn Event Center</h3>
            <p>13953 C F Hawn Freeway<br />Dallas, TX 75253</p>
            <a href={receptionMap} target="_blank" rel="noreferrer"><MapPin /> Cómo llegar</a>
          </article>
        </div>
        <p className="dress-note" data-reveal>Ven como tú eres. No hay código de vestimenta.</p>
      </section>

      <section className="gallery" aria-label="Galería de Jordanka">
        <div className="gallery__heading" data-reveal><p className="eyebrow">En su elemento</p><h2>Wild heart.<br />Soft soul.</h2></div>
        <div className="gallery__track">
          <figure className="gallery__frame gallery__frame--wide"><img src="/jordanka-ride.webp" alt="Jordanka montando su caballo" loading="lazy" /></figure>
          <figure className="gallery__frame gallery__frame--portrait"><img src="/jordanka-floral.webp" alt="Jordanka entre flores junto a su caballo" loading="lazy" /></figure>
          <figure className="gallery__frame gallery__frame--wide"><img src="/jordanka-field.webp" alt="Jordanka y su caballo en el campo" loading="lazy" /></figure>
        </div>
        <p className="gallery__hint">Desliza para ver más <span>→</span></p>
      </section>

      <section className="gift-section chapter chapter--green">
        <div className="gift-card" data-reveal>
          <div className="gift-card__icon"><Gift /></div><p className="eyebrow">Un detalle con cariño</p><h2>Lluvia de sobres</h2>
          <p>Tu presencia es el regalo más bonito. Si deseas obsequiarle algo a Jordanka, celebraremos con una lluvia de sobres durante la recepción.</p>
          <div className="gift-card__seal">J·A·H</div>
        </div>
      </section>

      <section id="rsvp" className="rsvp chapter chapter--ivory">
        <div className="chapter__number" aria-hidden="true">III</div>
        <div className="rsvp__intro" data-reveal><p className="eyebrow">Tu lugar nos importa</p><h2>¿Celebras<br />con nosotros?</h2><p>Registra tu respuesta en menos de un minuto.</p></div>

        {status === "success" ? (
          <div className="success-card" role="status" data-reveal data-visible="true">
            <span><Check /></span><p className="eyebrow">Respuesta recibida</p>
            <h3>{attendance === "yes" ? "¡Nos encantará verte!" : "Gracias por hacérnoslo saber."}</h3><p>Tu confirmación quedó registrada.</p>
          </div>
        ) : (
          <form className="rsvp-form" onSubmit={submitRsvp} data-reveal>
            <div className="field-block"><Label htmlFor="name">Nombre y apellido</Label><Input id="name" name="name" required maxLength={100} placeholder="Escribe tu nombre" /></div>
            <fieldset className="field-block">
              <legend>¿Podrás acompañarnos?</legend>
              <RadioGroup value={attendance} onValueChange={setAttendance} className="attendance-options">
                <Label className={attendance === "yes" ? "attendance-option attendance-option--active" : "attendance-option"}><RadioGroupItem value="yes" /> Sí, ahí estaré</Label>
                <Label className={attendance === "no" ? "attendance-option attendance-option--active" : "attendance-option"}><RadioGroupItem value="no" /> No podré asistir</Label>
              </RadioGroup>
            </fieldset>
            {attendance === "yes" && <div className="field-block"><Label htmlFor="guests">Personas en tu confirmación</Label><NativeSelect id="guests" name="guests" defaultValue="1" className="guest-select">{[1,2,3,4,5,6].map((number) => <NativeSelectOption key={number} value={number}>{number}</NativeSelectOption>)}</NativeSelect></div>}
            <div className="field-block"><Label htmlFor="message">Un mensaje para Jordanka <span>(opcional)</span></Label><Textarea id="message" name="message" maxLength={500} placeholder="Déjale unas palabras bonitas…" /></div>
            <input className="honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <Button type="submit" className="rsvp-submit" disabled={status === "sending"}>{status === "sending" ? "Registrando…" : "Confirmar asistencia"}</Button>
            {status === "error" && <p className="form-error" role="alert">No pudimos guardar tu respuesta. Intenta nuevamente.</p>}
          </form>
        )}
      </section>

      <footer><p className="footer__monogram">J·A·H</p><p>18 · Diciembre · 2026</p><span>Nos vemos en Dallas</span></footer>
    </main>
  );
}
