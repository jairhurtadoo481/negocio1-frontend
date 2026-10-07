import Link from "next/link";
import { obtenerProductos } from "../lib/api";
import ProductoCard from "./ProductoCard";

export default async function GridCategoria({ categoria, titulo, descripcion }) {
  let productos = [];
  let error = null;

  try {
    const data = await obtenerProductos({ categoria, limit: 1000 });
    productos = data.productos;
  } catch (e) {
    error = e.message;
  }

  return (
    <div>
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-20 grid md:grid-cols-2 gap-10 items-center">
        <div className="text-center md:text-left order-2 md:order-1">
          <Link href="/#categorias" className="text-xs tracking-[0.3em] uppercase text-macu-gold hover:underline">
            ← Tejidos Macu
          </Link>
          <h1 className="font-display text-5xl md:text-7xl text-macu-cream mt-4">{titulo}</h1>
          {descripcion && (
            <p className="text-macu-cream/80 text-base md:text-lg max-w-md mx-auto md:mx-0 mt-5">{descripcion}</p>
          )}
        </div>

        <div className="order-1 md:order-2 flex justify-center">
          <div className="relative aspect-[9/16] w-[200px] md:w-[270px] overflow-hidden rounded-3xl ring-4 ring-macu-gold shadow-2xl shadow-black/50 bg-macu-navy-dark">
            <video
              src={`/${categoria}.mp4`}
              autoPlay
              muted
              loop
              playsInline
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        {error && <p className="text-red-300">No pudimos cargar los productos. Intenta de nuevo en unos minutos.</p>}

        {!error && productos.length === 0 && (
          <p className="text-macu-cream/60 text-center">Pronto tendremos tejidos en esta categoría.</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {productos.map((producto) => (
            <ProductoCard key={producto._id} producto={producto} />
          ))}
        </div>
      </div>
    </div>
  );
}
