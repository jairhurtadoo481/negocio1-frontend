"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CarritoIndicador from "./CarritoIndicador";
import { CATEGORIAS } from "../lib/categorias";

const enlaceEscritorio =
  "text-macu-cream/90 hover:text-macu-gold hover:border-b-2 hover:border-macu-gold pb-0.5 transition";
const enlaceMovil = "text-macu-cream/90 hover:text-macu-gold transition";

export default function Navbar() {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [arriba, setArriba] = useState(true);

  useEffect(() => {
    const revisar = () => setArriba(window.scrollY < 12);
    revisar();
    window.addEventListener("scroll", revisar, { passive: true });
    return () => window.removeEventListener("scroll", revisar);
  }, []);

  const transparente = arriba && !menuAbierto;

  const manejarBuscar = (e) => {
    e.preventDefault();
    if (busqueda.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(busqueda.trim())}`);
      setMenuAbierto(false);
    }
  };

  const cerrarMenu = () => setMenuAbierto(false);

  const campoBusqueda = (
    <input
      type="text"
      placeholder="Buscar tejidos..."
      value={busqueda}
      onChange={(e) => setBusqueda(e.target.value)}
      className="w-full rounded-full px-4 py-2 text-sm text-macu-navy-dark outline-none border border-macu-gold/40 focus:border-macu-gold transition bg-macu-cream [text-shadow:none]"
    />
  );

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        transparente
          ? "bg-transparent border-transparent"
          : "bg-macu-navy-dark/90 backdrop-blur-md border-macu-gold/30 shadow-sm"
      }`}
      style={transparente ? { textShadow: "0 1px 10px rgba(10, 20, 40, 0.8)" } : undefined}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16 gap-4">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <span className="relative block w-11 h-11 rounded-full overflow-hidden ring-2 ring-macu-gold bg-[#f7f7f8] shrink-0">
            <Image src="/macu.png" alt="Tejidos Macu" fill sizes="44px" className="object-cover" priority />
          </span>
          <span className="font-display text-xl tracking-wide text-macu-cream whitespace-nowrap">
            TEJIDOS <span className="text-macu-gold">MACU</span>
          </span>
        </Link>

        <nav className="hidden xl:flex gap-5 text-sm font-semibold whitespace-nowrap items-center">
          <Link href="/" className={enlaceEscritorio}>
            Inicio
          </Link>
          {CATEGORIAS.map((c) => (
            <Link key={c.slug} href={`/${c.slug}`} className={enlaceEscritorio}>
              {c.nombre}
            </Link>
          ))}
          <Link href="/seguimiento" className={enlaceEscritorio}>
            Mi pedido
          </Link>
        </nav>

        <form onSubmit={manejarBuscar} className="hidden xl:block w-44">
          {campoBusqueda}
        </form>

        <div className="hidden xl:block">
          <CarritoIndicador />
        </div>

        <div className="flex items-center gap-4 xl:hidden">
          <CarritoIndicador />
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="flex flex-col gap-1.5 p-2"
            aria-label="Abrir menu"
          >
            <span className="w-6 h-0.5 bg-macu-cream"></span>
            <span className="w-6 h-0.5 bg-macu-cream"></span>
            <span className="w-6 h-0.5 bg-macu-cream"></span>
          </button>
        </div>
      </div>

      {menuAbierto && (
        <div className="xl:hidden bg-macu-navy-dark/95 backdrop-blur-md border-t border-macu-gold/30 px-4 py-4">
          <form onSubmit={manejarBuscar} className="mb-4">
            {campoBusqueda}
          </form>

          <nav className="flex flex-col gap-3 text-sm font-semibold">
            <Link href="/" onClick={cerrarMenu} className={enlaceMovil}>
              Inicio
            </Link>
            {CATEGORIAS.map((c) => (
              <Link key={c.slug} href={`/${c.slug}`} onClick={cerrarMenu} className={enlaceMovil}>
                {c.nombre}
              </Link>
            ))}
            <Link href="/seguimiento" onClick={cerrarMenu} className={enlaceMovil}>
              Mi pedido
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
