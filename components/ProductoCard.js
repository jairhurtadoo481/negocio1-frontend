import Link from "next/link";
import { nombreCategoria } from "../lib/categorias";

export default function ProductoCard({ producto }) {
  const imagen = producto.imagenes && producto.imagenes.length > 0
    ? producto.imagenes[0]
    : null;

  const tieneOferta = producto.precioOferta !== null && producto.precioOferta !== undefined;

  return (
    <Link
      href={`/producto/${producto._id}`}
      className="group block h-full"
    >
      <div className="bg-macu-cream rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full hover:-translate-y-1 border border-macu-gold/30">
        <div className="aspect-square bg-white overflow-hidden relative flex-shrink-0">
          {imagen ? (
            <img
              src={imagen}
              alt={producto.nombre}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-macu-navy/40 text-sm">Sin imagen</span>
            </div>
          )}
          {tieneOferta && (
            <span className="absolute top-3 left-3 bg-macu-gold text-macu-navy-dark text-xs px-3 py-1.5 uppercase tracking-wide font-bold rounded-full shadow-lg">
              Oferta
            </span>
          )}
        </div>
        <div className="p-4 flex flex-col flex-grow justify-between">
          <div>
            <p className="text-xs text-macu-navy/60 uppercase tracking-widest font-semibold">
              {nombreCategoria(producto.categoria)}
            </p>
            <h3 className="font-semibold text-sm text-macu-navy-dark mt-2 line-clamp-2 group-hover:text-macu-navy-light transition-colors">
              {producto.nombre}
            </h3>
          </div>
          <div className="mt-3 pt-3 border-t border-macu-navy/10">
            <div className="flex items-center gap-2">
              {tieneOferta ? (
                <>
                  <span className="text-lg font-bold text-macu-navy-dark">S/ {producto.precioOferta}</span>
                  <span className="text-macu-navy/40 line-through text-xs">S/ {producto.precio}</span>
                </>
              ) : (
                <span className="text-lg font-bold text-macu-navy-dark">S/ {producto.precio}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
