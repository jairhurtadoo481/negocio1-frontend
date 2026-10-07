const PASOS = [
  { titulo: "Elige tu tejido", texto: "Explora el catálogo y escoge tu favorito." },
  { titulo: "Haz tu pedido", texto: "Agrégalo en la web o escríbenos por WhatsApp o Instagram." },
  { titulo: "Adelanta el 50%", texto: "Pagas la mitad por Yape o transferencia y el resto contra entrega." },
  { titulo: "Recíbelo en casa", texto: "Entregas de 4 a 5 días. Gratis en la Plaza de Armas de Ica." },
];

export default function ComoComprar() {
  return (
    <section id="como-comprar" className="py-16 scroll-mt-16 border-t border-macu-gold/20">
      <div className="max-w-6xl mx-auto px-4">
        <p className="text-center text-xs tracking-[0.3em] uppercase text-macu-gold mb-2">Es muy fácil</p>
        <h2 className="font-display text-3xl md:text-4xl text-center mb-12 text-macu-cream">Cómo comprar</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PASOS.map((paso, i) => (
            <div key={paso.titulo} className="bg-macu-navy border border-macu-gold/20 rounded-2xl p-6">
              <span className="font-display text-4xl text-macu-gold">{i + 1}</span>
              <h3 className="font-semibold text-macu-cream mt-2 mb-1">{paso.titulo}</h3>
              <p className="text-sm text-macu-cream/70">{paso.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
