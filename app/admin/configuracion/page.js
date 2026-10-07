"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtegerAdmin from "../../../components/ProtegerAdmin";
import { obtenerConfiguracion, subirQr } from "../../../lib/api";
import { obtenerToken } from "../../../lib/auth";

const METODOS = [
  { tipo: "yape", nombre: "Yape", campo: "qrYape" },
  { tipo: "plin", nombre: "Plin", campo: "qrPlin" },
];

export default function ConfiguracionPage() {
  const [config, setConfig] = useState({ qrYape: null, qrPlin: null });
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    obtenerConfiguracion()
      .then(setConfig)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  const manejarSubida = async (tipo, e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    setSubiendo(tipo);
    setError("");
    try {
      const token = obtenerToken();
      const data = await subirQr(token, tipo, archivo);
      setConfig(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubiendo("");
    }
  };

  if (cargando) {
    return (
      <div className="bg-white min-h-screen">
        <p className="text-center py-16 text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <ProtegerAdmin>
      <div className="bg-white min-h-screen">
        <div className="max-w-lg mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Configuración de pagos</h1>
            <Link href="/admin" className="text-sm text-gray-600 hover:underline">
              Volver
            </Link>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Sube el QR de cada método. Los clientes lo ven al pagar el adelanto de su pedido.
          </p>

          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          {METODOS.map((m) => (
            <div key={m.tipo} className="border border-gray-200 rounded-lg p-4 mb-4">
              <p className="font-semibold mb-3 text-gray-900">QR de {m.nombre}</p>
              {config[m.campo] && (
                <img
                  src={config[m.campo]}
                  alt={`QR ${m.nombre}`}
                  className="w-40 h-40 object-contain mb-3 border border-gray-100 rounded"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => manejarSubida(m.tipo, e)}
                disabled={subiendo === m.tipo}
                className="border border-gray-300 rounded px-3 py-2 w-full text-sm bg-white text-gray-900"
              />
              {subiendo === m.tipo && <p className="text-xs text-gray-500 mt-1">Subiendo...</p>}
            </div>
          ))}
        </div>
      </div>
    </ProtegerAdmin>
  );
}
