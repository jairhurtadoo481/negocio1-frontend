"use client";

import { useState } from "react";
import { seguimientoReserva } from "../../lib/api";

const colorEstado = {
  pendiente: "bg-yellow-100 text-yellow-700",
  atendido: "bg-blue-100 text-blue-700",
  listo_recoger: "bg-purple-100 text-purple-700",
  entregado: "bg-green-100 text-green-700",
  suspendido: "bg-gray-200 text-gray-700",
};

const etiquetaEstado = {
  pendiente: "Pendiente de confirmación",
  atendido: "En proceso",
  listo_recoger: "Listo para entrega",
  entregado: "Entregado",
  suspendido: "Suspendido",
};

const claseInput = "border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-400";

export default function SeguimientoPage() {
  const [numero, setNumero] = useState("");
  const [celular, setCelular] = useState("");
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");
  const [buscando, setBuscando] = useState(false);

  const buscar = async (e) => {
    e.preventDefault();
    setError("");
    setResultado(null);
    setBuscando(true);

    try {
      const data = await seguimientoReserva(numero.trim(), celular.trim());
      setResultado(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div className="min-h-screen px-4">
      <div className="max-w-md mx-auto my-10 px-6 py-8 bg-white rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Estado de mi pedido</h1>

        <form onSubmit={buscar} className="flex flex-col gap-4 mb-6">
          <input
            type="text"
            placeholder="Número de pedido (ej: 1001)"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            className={claseInput}
            required
          />
          <input
            type="text"
            placeholder="Número de celular"
            value={celular}
            onChange={(e) => setCelular(e.target.value)}
            className={claseInput}
            required
          />
          <button
            type="submit"
            disabled={buscando}
            className="bg-macu-navy text-macu-cream rounded py-2 font-semibold hover:bg-macu-navy-light transition disabled:opacity-50"
          >
            {buscando ? "Buscando..." : "Ver estado"}
          </button>
        </form>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        {resultado && (
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-gray-900">Pedido #{resultado.numero}</span>
              <span className={`text-xs px-2 py-1 rounded ${colorEstado[resultado.estado] || ""}`}>
                {etiquetaEstado[resultado.estado] || resultado.estado}
              </span>
            </div>

            <p className="text-gray-700 mb-3">{resultado.mensaje}</p>

            <div className="text-sm text-gray-500 mb-2">
              {resultado.items.map((item, i) => (
                <p key={i}>
                  {item.cantidad}x {item.nombre} - Tamaño {item.talla}
                </p>
              ))}
            </div>

            <p className="font-bold text-gray-900">Total: S/ {resultado.total}</p>
          </div>
        )}
      </div>
    </div>
  );
}