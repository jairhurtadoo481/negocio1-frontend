const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP;
const MENSAJE = encodeURIComponent(
  "Hola! Quiero un pedido personalizado en Tejidos Macu. Te envío una imagen de referencia y la medida que deseo."
);

const EXTRAS = [
  { nombre: "Caja", precio: "S/ 6" },
  { nombre: "2 fotos", precio: "S/ 4" },
  { nombre: "Tarjeta personalizada", precio: "S/ 2" },
];

export default function PedidoPersonalizado() {
  return (
    <section className="py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="rounded-3xl border border-macu-gold/40 bg-gradient-to-br from-macu-navy-light/60 to-macu-navy p-8 md:p-12 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-macu-gold mb-2">A tu medida</p>
          <h2 className="font-display text-3xl md:text-4xl text-macu-cream mb-4">¿Tienes una idea en mente?</h2>
          <p className="text-macu-cream/80 max-w-xl mx-auto mb-8">
            Hacemos pedidos personalizados: personajes, profesiones, regalos especiales. Envíanos una imagen de referencia y la medida que deseas.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {EXTRAS.map((extra) => (
              <span
                key={extra.nombre}
                className="border border-macu-gold/40 rounded-full px-4 py-1.5 text-sm text-macu-cream"
              >
                {extra.nombre} <span className="text-macu-gold font-semibold">{extra.precio}</span>
              </span>
            ))}
          </div>

          <a
            href={`https://wa.me/${WHATSAPP}?text=${MENSAJE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-macu-gold text-macu-navy-dark px-8 py-3 text-sm tracking-wide uppercase font-bold hover:brightness-110 transition rounded-full"
          >
            Escríbenos por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
