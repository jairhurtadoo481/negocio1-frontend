const POLITICAS = [
  "Las entregas se realizan entre 4 a 5 días.",
  "Se abona el 50% del total y el resto es contra entrega, por Yape o transferencia.",
  "Entregas en la Plaza de Armas de Ica sin costo adicional.",
  "Envíos fuera de Ica por Shalom, con pago del 100%.",
  "El delivery tiene un costo adicional.",
  "No se hacen devoluciones.",
];

export default function PoliticasCompra() {
  return (
    <section id="politicas" className="py-16 scroll-mt-16 border-t border-macu-gold/20">
      <div className="max-w-3xl mx-auto px-4">
        <p className="text-center text-xs tracking-[0.3em] uppercase text-macu-gold mb-2">Antes de comprar</p>
        <h2 className="font-display text-3xl md:text-4xl text-center mb-10 text-macu-cream">
          Lo que debes saber sobre tu compra
        </h2>

        <ul className="space-y-3">
          {POLITICAS.map((texto) => (
            <li key={texto} className="flex gap-3 items-start text-macu-cream/90">
              <span className="mt-2 w-2 h-2 rounded-full bg-macu-gold shrink-0" />
              <span>{texto}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
