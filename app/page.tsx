"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { CalendarDays, Check, ChevronDown, Gift, MapPin, MessageCircle, Music2, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import jordankaPortrait from "./assets/jordanka-portrait.webp";
import jordankaHat from "./assets/jordanka-hat.webp";
import jordankaRide from "./assets/jordanka-ride.webp";
import jordankaFloral from "./assets/jordanka-floral.webp";
import jordankaField from "./assets/jordanka-field.webp";

const EVENT_DATE = new Date("2026-12-18T14:00:00-06:00");
const MUSIC_READY = false;
const RSVP_WHATSAPP_NUMBER = "14698656022";
const ceremonyMap = "https://www.google.com/maps/search/?api=1&query=3030+Gus+Thomasson+Rd+Dallas+TX+75228";
const receptionMap = "https://www.google.com/maps/search/?api=1&query=Hawn+Event+Center+13953+C+F+Hawn+Freeway+Dallas+TX+75253";

function createWhatsAppConfirmation(payload: { name: string; attendance: string; guests: number; message: string }) {
  const attending = payload.attendance === "yes";
  const lines = [
    "Hola, confirmo mi asistencia a los Sweet Sixteen de Jordanka Hernández.",
    "",
    `Nombre: ${payload.name.trim()}`,
    `Respuesta: ${attending ? "Sí, asistiré" : "No podré asistir"}`,
    ...(attending ? [`Personas en la confirmación: ${payload.guests}`] : []),
    ...(payload.message.trim() ? [`Mensaje: ${payload.message.trim()}`] : []),
    "Fecha: 18 de diciembre de 2026",
  ];
  return `https://wa.me/${RSVP_WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
}

function useCountdown() {
  const [remaining, setRemaining] = useState(() => EVENT_DATE.getTime() - Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(EVENT_DATE.getTime() - Date.now()), 1000);
    return () => window.clearInterval(timer);
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
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [whatsappConfirmation, setWhatsappConfirmation] = useState("");
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

  function submitRsvp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      attendance,
      guests: attendance === "yes" ? Number(form.get("guests") ?? 1) : 0,
      message: String(form.get("message") ?? ""),
    };
    const whatsappUrl = createWhatsAppConfirmation(payload);
    setWhatsappConfirmation(whatsappUrl);
    setStatus("success");
    const whatsappWindow = window.open(whatsappUrl, "_blank");
    if (whatsappWindow) whatsappWindow.opener = null;
    else window.location.assign(whatsappUrl);
  }

  return (
    <main className="invitation-shell">
      <audio ref={audioRef} src={MUSIC_READY ? "/song.mp3" : undefined} loop preload="none" />

      <div className={`entrance ${entered ? "entrance--open" : ""}`} aria-hidden={entered}>
        <div className="entrance__halo" />
        <div className="entrance__edition"><span>Edición especial</span><span>No. 16</span></div>
        <p className="eyebrow entrance__eyebrow">The Sweet Sixteen Issue</p>
        <button className="seal" onClick={enterInvitation} aria-label="Abrir invitación de Jordanka">
          <span className="seal__initials">JA</span><span className="seal__orbit" />
        </button>
        <h1 className="entrance__name">Jordanka Hernández</h1>
        <p className="entrance__hint">Rompe el sello para entrar</p>
      </div>

      {MUSIC_READY && entered && (
        <button className="music-control" onClick={toggleMusic} aria-label={musicPlaying ? "Pausar música" : "Reproducir música"}>
          {musicPlaying ? <Pause /> : <Music2 />}<span>{musicPlaying ? "Pausar" : "Música"}</span>
        </button>
      )}

      <section className="hero" aria-label="Invitación principal">
        <img src={jordankaPortrait.src} alt="Jordanka junto a su caballo adornado con flores" className="hero__image" />
        <div className="hero__veil" />
        <div className="hero__cover-top"><span>Sweet Sixteen</span><span>Dallas · 2026</span></div>
        <div className="hero__masthead" aria-hidden="true">Jordanka</div>
        <div className="hero__issue" aria-hidden="true"><span>No.</span><strong>16</strong></div>
        <div className="hero__vertical" aria-hidden="true">The debut issue · December eighteenth</div>
        <div className="hero__content">
          <p className="eyebrow">Edición especial · 18.12.2026</p>
          <h2><span>Su</span><span>momento.</span></h2>
          <p className="hero__line">Una tarde para florecer.<br />Una noche para recordar.</p>
        </div>
        <a href="#historia" className="scroll-cue" aria-label="Descubrir la invitación"><span>Descubre</span><ChevronDown /></a>
      </section>

      <section id="historia" className="chapter chapter--ivory">
        <div className="chapter__number" aria-hidden="true">I</div>
        <div className="story-copy" data-reveal>
          <div className="story-copy__folio"><span>Profile</span><span>01</span></div>
          <p className="eyebrow">La chica del momento</p>
          <h2>Hay momentos que merecen convertirse en historia.</h2>
          <p>Acompáñanos a celebrar los dieciséis años de Jordanka: una fecha que marca nuevos sueños, nuevas aventuras y recuerdos que viviremos juntos.</p>
          <div className="signature">Jordanka</div>
        </div>
      </section>

      <section className="portrait-break portrait-break--first">
        <img src={jordankaHat.src} alt="Retrato de Jordanka con vestido rosa y sombrero blanco" />
        <div className="portrait-break__quote" data-reveal><small>Cover story / 02</small><span>The girl</span><strong>of the moment.</strong></div>
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
        <p className="dress-note" data-reveal>Vestimenta formal o tipo cóctel.</p>
      </section>

      <section className="gallery" aria-label="Galería de Jordanka">
        <div className="gallery__heading" data-reveal>
          <div className="gallery__folio"><span>The Equestrian Edit</span><span>Portfolio 01</span></div>
          <p className="eyebrow">En su propio mundo</p>
          <h2>Wild grace.<br /><i>Soft soul.</i></h2>
          <p className="gallery__intro">Tres retratos. Una protagonista. Desliza hacia abajo y entra en la historia.</p>
        </div>
        <div className="gallery__stack">
          <figure className="gallery__slide gallery__slide--one">
            <img src={jordankaRide.src} alt="Jordanka montando su caballo" />
            <figcaption><span>Portrait 01 / Motion</span><strong>Born to be<br />remembered.</strong></figcaption>
          </figure>
          <figure className="gallery__slide gallery__slide--two">
            <img src={jordankaFloral.src} alt="Jordanka entre flores junto a su caballo" />
            <figcaption><span>Portrait 02 / Bloom</span><strong>Where wild<br /><i>meets wonder.</i></strong></figcaption>
          </figure>
          <figure className="gallery__slide gallery__slide--three">
            <img src={jordankaField.src} alt="Jordanka y su caballo en el campo" />
            <figcaption><span>Portrait 03 / The Cover</span><strong>This is<br />sixteen.</strong></figcaption>
          </figure>
        </div>
      </section>

      <section className="parents-note chapter">
        <div className="parents-note__folio"><span>Carta abierta</span><span>Con amor</span></div>
        <div className="parents-note__title" data-reveal>
          <p className="eyebrow">De parte de sus padres</p>
          <h2>Para Jordanka,<br /><i>y para quienes han sido parte de su historia.</i></h2>
        </div>
        <div className="parents-note__letter" data-reveal>
          <p>Jordanka, verte crecer ha sido el privilegio más hermoso de nuestras vidas. Nos llenas de orgullo con tu alegría, tu fuerza y esa manera tan tuya de convertir cada momento en algo especial. Hoy celebramos tus dieciséis años, pero también celebramos la maravillosa persona en la que te estás convirtiendo.</p>
          <p>A nuestra familia y a nuestros amigos: gracias por acompañarla, quererla y dejar una huella en su camino. Cada uno de ustedes ocupa un lugar importante en esta historia. Su presencia hará que esta celebración sea todavía más inolvidable para ella y para nosotros.</p>
          <strong>Con todo nuestro amor,<br />tus padres.</strong>
        </div>
      </section>

      <section className="gift-section chapter chapter--green">
        <div className="gift-card" data-reveal>
          <div className="gift-card__icon"><Gift /></div><p className="eyebrow">Un detalle con cariño</p><h2>Lluvia de sobres</h2>
          <p>Tu presencia es el regalo más bonito. Si deseas obsequiarle algo a Jordanka, celebraremos con una lluvia de sobres durante la recepción.</p>
          <div className="gift-card__seal">JA</div>
        </div>
      </section>

      <section id="rsvp" className="rsvp chapter chapter--ivory">
        <div className="chapter__number" aria-hidden="true">III</div>
        <div className="rsvp__intro" data-reveal><p className="eyebrow">Tu lugar nos importa</p><h2>¿Celebras<br />con nosotros?</h2><p>Envíanos tu respuesta por WhatsApp en menos de un minuto.</p></div>

        {status === "success" ? (
          <div className="success-card" role="status" data-reveal data-visible="true">
            <span><Check /></span><p className="eyebrow">Mensaje preparado</p>
            <h3>{attendance === "yes" ? "¡Nos encantará verte!" : "Gracias por hacérnoslo saber."}</h3>
            <p>Para completar tu confirmación, envía el mensaje preparado por WhatsApp.</p>
            {whatsappConfirmation && <a className="whatsapp-confirmation" href={whatsappConfirmation} target="_blank" rel="noreferrer"><MessageCircle /> Enviar por WhatsApp</a>}
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
            <Button type="submit" className="rsvp-submit"><MessageCircle /> Confirmar por WhatsApp</Button>
            <p className="whatsapp-note"><MessageCircle /> Abriremos WhatsApp con tu respuesta lista para enviar.</p>
          </form>
        )}
      </section>

      <footer><p className="footer__monogram">JA</p><p>18 · Diciembre · 2026</p><span>Nos vemos en Dallas</span></footer>
    </main>
  );
}
