import Link from "next/link";
import { obtenerProductos } from "../../lib/api";
import { CATEGORIAS } from "../../lib/categorias";
import ProductoCard from "../../components/ProductoCard";

const filtros = [{ valor: "", etiqueta: "Todos" }, ...CATEGORIAS.map((c) => ({ valor: c.slug, etiqueta: c.nombre }))];

export default async function BuscarPage({ searchParams }) {
  const params = await searchParams;
  const q = params?.q || "";
  const categoria = params?.categoria || "";

  let productos = [];
  let error = null;

  if (q) {
    try {
      const apiParams = { q, limit: 100 };
      if (categoria) apiParams.categoria = categoria;
      const data = await obtenerProductos(apiParams);
      productos = data.productos;
    } catch (e) {
      error = e.message;
    }
  }

  return (
    <div className="min-h-[60vh]">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="font-display text-3xl mb-6 text-macu-cream">
          {q ? `Resultados para "${q}"` : "Buscar tejidos"}
        </h1>

        {q && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {filtros.map((c) => (
              <Link
                key={c.valor}
                href={`/buscar?q=${encodeURIComponent(q)}${c.valor ? `&categoria=${c.valor}` : ""}`}
                className={`text-sm px-4 py-2 rounded-full border transition ${
                  categoria === c.valor
                    ? "bg-macu-gold text-macu-navy-dark border-macu-gold font-semibold"
                    : "border-macu-cream/40 text-macu-cream/80 hover:border-macu-gold hover:text-macu-gold"
                }`}
              >
                {c.etiqueta}
              </Link>
            ))}
          </div>
        )}

        {error && <p className="text-red-300">No pudimos buscar ahora. Intenta de nuevo en unos minutos.</p>}

        {!error && q && productos.length === 0 && (
          <p className="text-macu-cream/60">No se encontraron tejidos para "{q}".</p>
        )}

        {!q && <p className="text-macu-cream/60">Escribe algo en el buscador de arriba.</p>}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-8">
          {productos.map((producto) => (
            <ProductoCard key={producto._id} producto={producto} />
          ))}
        </div>
      </div>
    </div>
  );
}
