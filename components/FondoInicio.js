"use client";

import { useEffect, useState } from "react";

const NITIDAS = [1, 2, 3, 4, 5].map((n) => `/fondos/web-${n}.jpg`);
const DIFUMINADAS = [1, 2, 3, 4, 5].map((n) => `/fondos/bg-${n}.jpg`);

// Va del afiche al logo y vuelve, quedándose más tiempo en los extremos.
const ORDEN = [0, 1, 2, 3, 4, 3, 2, 1];
const ESPERA_MS = [3500, 400, 400, 400, 3500, 400, 400, 400];

export default function FondoInicio() {
  const [paso, setPaso] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const temporizador = setTimeout(() => setPaso((p) => (p + 1) % ORDEN.length), ESPERA_MS[paso]);
    return () => clearTimeout(temporizador);
  }, [paso]);

  const activo = ORDEN[paso];
  const previo = ORDEN[(paso + ORDEN.length - 1) % ORDEN.length];

  const estilo = (i) => ({
    opacity: i === activo || i === previo ? 1 : 0,
    zIndex: i === activo ? 2 : i === previo ? 1 : 0,
    transition: i === activo ? "opacity 400ms linear" : "none",
  });

  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden bg-macu-navy">
      <div className="absolute inset-0 z-0">
        {DIFUMINADAS.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={estilo(i)}
          />
        ))}
      </div>

      <div className="absolute inset-0 z-[1]">
        {NITIDAS.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className="fondo-nitido absolute top-0 left-1/2 -translate-x-1/2"
            style={estilo(i)}
          />
        ))}
      </div>

      <div className="absolute inset-0 z-10 bg-macu-navy-dark/50 landscape:bg-macu-navy-dark/35" />
    </div>
  );
}
