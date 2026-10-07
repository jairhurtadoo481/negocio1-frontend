"use client";

import { useState } from "react";

export default function BotonCompartir({ producto }) {
  const [copiado, setCopiado] = useState(false);

  const compartir = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: producto.nombre,
          text: `Mira este tejido de Tejidos Macu: ${producto.nombre}`,
          url,
        });
      } catch (e) {
        // El usuario cancelo el share, no hacemos nada
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  return (
    <button
      onClick={compartir}
      className="flex items-center justify-center gap-2 border border-macu-cream/50 text-macu-cream rounded-full py-2 font-semibold hover:bg-macu-cream hover:text-macu-navy-dark transition mt-2 w-full"
    >
      {copiado ? "¡Link copiado!" : "Compartir"}
    </button>
  );
}