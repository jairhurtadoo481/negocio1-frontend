import Link from "next/link";
import { obtenerProductoPorId } from "../../../lib/api";
import { obtenerCategoria } from "../../../lib/categorias";
import GaleriaProducto from "../../../components/GaleriaProducto";
import ContadorOferta from "../../../components/ContadorOferta";
import BotonWhatsapp from "../../../components/BotonWhatsapp";
import BotonCompartir from "../../../components/BotonCompartir";
import AgregarCarrito from "../../../components/AgregarCarrito";
import SelectorVariantes from "../../../components/SelectorVariantes";

export default async function ProductoPage({ params }) {
  const { id } = await params;

  let producto = null;
  let error = null;

  try {
    producto = await obtenerProductoPorId(id);
  } catch (e) {
    error = e.message;
  }

  if (error || !producto) {
    return (
      <div className="min-h-[60vh]">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-macu-cream/70 mb-4">No encontramos este tejido.</p>
          <Link href="/" className="text-macu-gold hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const tieneOferta = producto.ofertaActiva === true;
  const categoria = obtenerCategoria(producto.categoria);

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-12">
        <GaleriaProducto imagenes={producto.imagenes} videos={producto.videos} nombre={producto.nombre} />

        <div>
          {categoria && (
            <Link
              href={`/${categoria.slug}`}
              className="text-xs text-macu-gold uppercase tracking-widest font-semibold hover:underline"
            >
              {categoria.nombre}
            </Link>
          )}
          <h1 className="font-display text-4xl mt-2 text-macu-cream">{producto.nombre}</h1>
          {producto.codigo && (
            <p className="text-xs text-macu-cream/50 mt-1">Código: {producto.codigo}</p>
          )}

          <div className="mt-6 flex items-center gap-4 pb-6 border-b border-macu-gold/30">
            {tieneOferta ? (
              <>
                <span className="text-3xl font-bold text-macu-gold">S/ {producto.precioOferta}</span>
                <span className="text-lg text-macu-cream/50 line-through">S/ {producto.precio}</span>
              </>
            ) : (
              <span className="text-3xl font-bold text-macu-gold">S/ {producto.precio}</span>
            )}
          </div>

          {tieneOferta && producto.ofertaFin && (
            <div className="my-4">
              <ContadorOferta ofertaFin={producto.ofertaFin} />
            </div>
          )}

          {producto.descripcion && (
            <p className="text-macu-cream/80 mt-6 leading-relaxed text-sm whitespace-pre-line">{producto.descripcion}</p>
          )}

          {producto.personalizable && (
            <p className="mt-6 text-sm border border-macu-gold/40 rounded-xl px-4 py-3 text-macu-cream/90">
              Este tejido se puede personalizar. Escríbenos con una imagen de referencia y la medida que deseas.
            </p>
          )}

          {producto.colores && producto.colores.length > 0 && (
            <div className="mt-8">
              <p className="font-bold mb-3 text-sm uppercase tracking-wide text-macu-gold">Colores</p>
              <div className="flex gap-2 flex-wrap">
                {producto.colores.map((color) => (
                  <span
                    key={color}
                    className="border border-macu-cream/40 rounded-full px-4 py-1.5 text-sm text-macu-cream"
                  >
                    {color}
                  </span>
                ))}
              </div>
            </div>
          )}

          {producto.tallas && producto.tallas.length > 0 && (
            <div className="mt-8">
              <p className="font-bold mb-3 text-sm uppercase tracking-wide text-macu-gold">Tamaños disponibles</p>
              <div className="flex flex-wrap gap-2">
                {producto.tallas.map((t) => (
                  <span
                    key={t.talla}
                    className={`border rounded-full px-4 py-1.5 text-sm ${
                      t.stock > 0
                        ? "border-macu-cream/40 text-macu-cream"
                        : "border-macu-cream/15 text-macu-cream/30 line-through"
                    }`}
                  >
                    {t.talla}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10">
            <SelectorVariantes productoId={producto._id} />
          </div>

          <div className="mt-6">
            <AgregarCarrito producto={producto} />
          </div>

          <div className="mt-6 flex gap-3">
            <BotonWhatsapp producto={producto} />
            <BotonCompartir producto={producto} />
          </div>
        </div>
      </div>
    </div>
  );
}
