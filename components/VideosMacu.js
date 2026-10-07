"use client";

import { useEffect, useRef, useState } from "react";

const marco =
  "relative aspect-[9/16] overflow-hidden rounded-3xl ring-2 ring-macu-gold/70 shadow-2xl shadow-black/50 bg-macu-navy-dark";

export default function VideosMacu() {
  const seccionRef = useRef(null);
  const izquierdaRef = useRef(null);
  const centroRef = useRef(null);
  const derechaRef = useRef(null);
  const [sonido, setSonido] = useState(false);
  const [sinMovimiento, setSinMovimiento] = useState(false);

  useEffect(() => {
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setSinMovimiento(reducir);
    if (reducir) return;

    const videos = [izquierdaRef, centroRef, derechaRef].map((r) => r.current).filter(Boolean);
    const observador = new IntersectionObserver(
      ([entrada]) => {
        videos.forEach((v) => {
          if (entrada.isIntersecting) {
            v.play().catch(() => {});
          } else {
            v.pause();
          }
        });
      },
      { threshold: 0.25 }
    );

    if (seccionRef.current) observador.observe(seccionRef.current);
    return () => observador.disconnect();
  }, []);

  const alternarSonido = () => {
    const siguiente = !sonido;
    if (centroRef.current) centroRef.current.muted = !siguiente;
    setSonido(siguiente);
  };

  const propsVideo = {
    muted: true,
    loop: true,
    playsInline: true,
    preload: "auto",
    controls: sinMovimiento,
    className: "absolute inset-0 w-full h-full object-cover",
  };

  return (
    <section ref={seccionRef} className="py-16 md:py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <p className="text-center text-xs tracking-[0.3em] uppercase text-macu-gold mb-2">Míralos de cerca</p>
        <h2 className="font-display text-3xl md:text-4xl text-center mb-12 md:mb-16 text-macu-cream">
          Tejidos con historia
        </h2>

        <div className="flex items-center justify-center">
          <div
            className={`${marco} w-[29vw] md:w-[220px] -mr-[5vw] md:mr-0 md:mx-3 z-0 -rotate-3 translate-y-6 md:translate-y-10 opacity-90 hover:opacity-100 hover:-rotate-1 transition-all duration-300`}
          >
            <video ref={izquierdaRef} src="/1.mp4#t=0.1" {...propsVideo} />
          </div>

          <div className={`${marco} w-[44vw] md:w-[300px] z-10 md:mx-3 md:scale-105 ring-4 ring-macu-gold`}>
            <video ref={centroRef} src="/4.mp4#t=0.1" {...propsVideo} />
            {!sinMovimiento && (
              <button
                type="button"
                onClick={alternarSonido}
                aria-label={sonido ? "Silenciar video" : "Activar sonido del video"}
                className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-macu-navy-dark/80 backdrop-blur text-macu-cream flex items-center justify-center hover:bg-macu-gold hover:text-macu-navy-dark transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  {sonido ? (
                    <>
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </>
                  ) : (
                    <>
                      <line x1="23" y1="9" x2="17" y2="15" />
                      <line x1="17" y1="9" x2="23" y2="15" />
                    </>
                  )}
                </svg>
              </button>
            )}
          </div>

          <div
            className={`${marco} w-[29vw] md:w-[220px] -ml-[5vw] md:ml-0 md:mx-3 z-0 rotate-3 translate-y-6 md:translate-y-10 opacity-90 hover:opacity-100 hover:rotate-1 transition-all duration-300`}
          >
            <video ref={derechaRef} src="/2.mp4#t=0.1" {...propsVideo} />
          </div>
        </div>
      </div>
    </section>
  );
}
