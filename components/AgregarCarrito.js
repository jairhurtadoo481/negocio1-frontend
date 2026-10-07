"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { agregarAlCarrito } from "../lib/carrito";

export default function AgregarCarrito({ producto }) {
  const router = useRouter();
  const [tallaSeleccionada, setTallaSeleccionada] = useState("");
  const [mensaje, setMensaje] = useState("");

  const tallasConStock = (producto.tallas || []).filter((t) => t.stock > 0);

  const manejarAgregar = () => {
    if (!tallaSeleccionada) {
      setMensaje("Selecciona un tamaño primero");
      return;
    }

    agregarAlCarrito({
      productoId: producto._id,
      nombre: producto.nombre,
      imagen: producto.imagenes?.[0] || null,
      talla: tallaSeleccionada,
      cantidad: 1,
      precioUnitario: producto.ofertaActiva ? producto.precioOferta : producto.precio,
      tieneOferta: producto.ofertaActiva === true,
    });

    setMensaje("Agregado a tu pedido");
    setTimeout(() => setMensaje(""), 2000);
  };

  if (tallasConStock.length === 0) {
    return <p className="text-sm text-macu-cream/60 mt-4">Sin stock disponible por ahora. Escríbenos y lo tejemos para ti.</p>;
  }

  return (
    <div className="mt-4">
      <p className="font-semibold mb-2 text-macu-cream">Selecciona tu tamaño</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {tallasConStock.map((t) => (
          <button
            key={t.talla}
            onClick={() => setTallaSeleccionada(t.talla)}
            className={`border rounded-full px-4 py-1.5 text-sm transition ${
              tallaSeleccionada === t.talla
                ? "bg-macu-gold text-macu-navy-dark border-macu-gold font-semibold"
                : "border-macu-cream/40 text-macu-cream hover:border-macu-gold"
            }`}
          >
            {t.talla}
          </button>
        ))}
      </div>

      <button
        onClick={manejarAgregar}
        className="w-full bg-macu-gold text-macu-navy-dark rounded-full py-3 font-bold hover:brightness-110 transition"
      >
        Agregar a mi pedido
      </button>

      {mensaje && (
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm text-macu-gold">{mensaje}</p>
          <button
            onClick={() => router.push("/carrito")}
            className="text-sm text-macu-cream hover:text-macu-gold underline"
          >
            Ver mi pedido
          </button>
        </div>
      )}
    </div>
  );
}
