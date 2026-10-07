"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

function TarjetaCategoria({ categoria }) {
  const tarjetaRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const tarjeta = tarjetaRef.current;
    const video = videoRef.current;
    if (!tarjeta || !video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.3 }
    );
    observador.observe(tarjeta);
    return () => observador.disconnect();
  }, []);

  return (
    <Link
      ref={tarjetaRef}
      href={`/${categoria.slug}`}
      className="group relative aspect-[4/5] rounded-2xl overflow-hidden border border-macu-gold/30 bg-gradient-to-br from-macu-navy-light to-macu-navy-dark hover:border-macu-gold transition-colors"
    >
      <video
        ref={videoRef}
        src={`/${categoria.slug}.mp4#t=0.1`}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-macu-navy-dark via-macu-navy-dark/50 to-transparent" />
      <div className="absolute bottom-0 p-4 md:p-6">
        <h3 className="font-display text-2xl md:text-3xl text-macu-cream">{categoria.nombre}</h3>
        <p className="text-xs md:text-sm text-macu-cream/80 mt-1 line-clamp-2">{categoria.descripcion}</p>
        <span className="inline-block mt-3 text-macu-gold text-xs uppercase tracking-widest font-semibold">
          Ver colección →
        </span>
      </div>
    </Link>
  );
}

export default function CategoriasDestacadas({ categorias }) {
  return (
    <section id="categorias" className="py-20 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4">
        <p className="text-center text-xs tracking-[0.3em] uppercase text-macu-gold mb-2">Elige tu categoría</p>
        <h2 className="font-display text-3xl md:text-4xl text-center mb-12 text-macu-cream">Nuestros tejidos</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {categorias.map((c) => (
            <TarjetaCategoria key={c.slug} categoria={c} />
          ))}
        </div>
      </div>
    </section>
  );
}
