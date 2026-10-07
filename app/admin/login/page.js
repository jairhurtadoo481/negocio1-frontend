"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { login } from "../../../lib/api";
import { guardarSesion } from "../../../lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const data = await login(email, password);

      if (data.usuario.rol !== "admin") {
        setError("Esta cuenta no tiene acceso al panel de administrador.");
        setCargando(false);
        return;
      }

      guardarSesion(data.token, data.usuario);
      router.push("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm bg-white text-gray-900 rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-6">
          <span className="relative block w-16 h-16 rounded-full overflow-hidden ring-2 ring-macu-gold bg-[#f7f7f8] mb-3">
            <Image src="/macu.png" alt="Tejidos Macu" fill sizes="64px" className="object-cover" />
          </span>
          <h1 className="text-xl font-bold">Panel Admin</h1>
          <p className="text-sm text-gray-500">Tejidos Macu</p>
        </div>

        <form onSubmit={manejarSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-400"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-400"
            required
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={cargando}
            className="bg-macu-navy text-macu-cream rounded py-2 font-semibold hover:bg-macu-navy-light transition disabled:opacity-50"
          >
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
