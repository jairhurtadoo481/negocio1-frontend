import { obtenerProductos } from "../lib/api";
import { CATEGORIAS } from "../lib/categorias";
import ProductoCard from "../components/ProductoCard";
import HeroInicio from "../components/HeroInicio";
import FondoInicio from "../components/FondoInicio";
import VideosMacu from "../components/VideosMacu";
import CategoriasDestacadas from "../components/CategoriasDestacadas";
import ComoComprar from "../components/ComoComprar";
import PedidoPersonalizado from "../components/PedidoPersonalizado";
import PoliticasCompra from "../components/PoliticasCompra";

export default async function Home() {
  let destacados = [];
  let error = null;

  try {
    const data = await obtenerProductos({ destacado: "true", limit: 8 });
    destacados = data.productos;
  } catch (e) {
    error = e.message;
  }

  return (
    <div className="sombra-texto">
      <FondoInicio />
      <HeroInicio />
      <VideosMacu />
      <CategoriasDestacadas categorias={CATEGORIAS} />

      <section className="max-w-7xl mx-auto px-4 py-16 border-t border-macu-gold/20">
        <p className="text-xs tracking-[0.3em] uppercase text-macu-gold mb-2">Recomendados</p>
        <h2 className="font-display text-3xl md:text-4xl mb-8 text-macu-cream">Destacados</h2>

        {error && <p className="text-red-300">No pudimos cargar los productos. Intenta de nuevo en unos minutos.</p>}

        {!error && destacados.length === 0 && (
          <p className="text-macu-cream/60">Pronto verás aquí nuestros tejidos destacados.</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {destacados.map((producto) => (
            <ProductoCard key={producto._id} producto={producto} />
          ))}
        </div>
      </section>

      <ComoComprar />
      <PedidoPersonalizado />
      <PoliticasCompra />
    </div>
  );
}
