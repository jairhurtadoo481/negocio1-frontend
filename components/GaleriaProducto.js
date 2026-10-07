"use client";

import { useState, useRef } from "react";

export default function GaleriaProducto({ imagenes = [], videos = [], nombre }) {
  const [activa, setActiva] = useState(0);
  const [zoomActivo, setZoomActivo] = useState(false);
  const [posicion, setPosicion] = useState({ x: 50, y: 50 });
  const contenedorRef = useRef(null);

  const items = [
    ...(imagenes || []).map((src) => ({ tipo: "imagen", src })),
    ...(videos || []).map((src) => ({ tipo: "video", src })),
  ];

  if (items.length === 0) {
    return (
      <div className="aspect-square bg-macu-navy flex items-center justify-center rounded-2xl">
        <span className="text-macu-cream/50">Sin imágenes</span>
      </div>
    );
  }

  const actual = items[Math.min(activa, items.length - 1)];

  const manejarMovimiento = (e) => {
    const rect = contenedorRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosicion({ x, y });
  };

  return (
    <div>
      {actual.tipo === "imagen" ? (
        <div
          ref={contenedorRef}
          className="aspect-square bg-macu-cream rounded-2xl overflow-hidden cursor-zoom-in border border-macu-gold/30"
          onMouseEnter={() => setZoomActivo(true)}
          onMouseLeave={() => setZoomActivo(false)}
          onMouseMove={manejarMovimiento}
        >
          <img
            src={actual.src}
            alt={nombre}
            className="w-full h-full object-cover transition-transform duration-150"
            style={
              zoomActivo
                ? {
                    transform: "scale(2)",
                    transformOrigin: `${posicion.x}% ${posicion.y}%`,
                  }
                : { transform: "scale(1)" }
            }
          />
        </div>
      ) : (
        <div className="aspect-square bg-black rounded-2xl overflow-hidden border border-macu-gold/30">
          <video
            key={actual.src}
            src={actual.src}
            controls
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-contain"
          />
        </div>
      )}

      {items.length > 1 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {items.map((item, i) => (
            <button
              key={item.src}
              onClick={() => setActiva(i)}
              aria-label={item.tipo === "video" ? `Ver video ${nombre}` : `Ver imagen ${i + 1} de ${nombre}`}
              className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 ${
                i === activa ? "border-macu-gold" : "border-transparent"
              }`}
            >
              {item.tipo === "imagen" ? (
                <img src={item.src} alt={`${nombre} ${i + 1}`} className="w-full h-full object-cover" />
              ) : (
                <>
                  <video
                    src={`${item.src}#t=0.1`}
                    muted
                    preload="metadata"
                    playsInline
                    className="w-full h-full object-cover bg-black"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white text-lg">
                    ▶
                  </span>
                </>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
