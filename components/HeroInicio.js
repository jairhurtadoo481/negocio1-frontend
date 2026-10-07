import Link from "next/link";
import Image from "next/image";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP;
const MENSAJE_PERSONALIZADO = encodeURIComponent("Hola! Quiero hacer un pedido personalizado en Tejidos Macu.");

export default function HeroInicio() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(233,184,74,0.14),transparent_60%)]" />

      <div className="relative max-w-6xl mx-auto px-4 py-14 md:py-24 grid md:grid-cols-2 gap-10 items-center">
        <div className="text-center md:text-left order-2 md:order-1">
          <p className="text-macu-gold text-sm tracking-[0.3em] uppercase mb-4">Hecho a mano en Ica</p>
          <h1 className="font-display text-5xl md:text-7xl leading-[1.05] mb-6 text-macu-cream">
            Tejidos <span className="text-macu-gold">Macu</span>
          </h1>
          <p className="text-macu-cream/80 text-base md:text-lg max-w-md mx-auto md:mx-0 mb-10">
            Si buscas un tejido lindo, estás en el lugar correcto. Amigurumis, ramos y detalles tejidos a crochet, hechos con cariño.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link
              href="#categorias"
              className="bg-macu-gold text-macu-navy-dark px-8 py-3 text-sm tracking-wide uppercase font-bold hover:brightness-110 transition rounded-full"
            >
              Ver catálogo
            </Link>
            <a
              href={`https://wa.me/${WHATSAPP}?text=${MENSAJE_PERSONALIZADO}`}
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-macu-cream/70 text-macu-cream px-8 py-3 text-sm tracking-wide uppercase font-semibold hover:bg-macu-cream hover:text-macu-navy-dark transition rounded-full"
            >
              Pedido personalizado
            </a>
          </div>
        </div>

        <div className="order-1 md:order-2 flex justify-center">
          <div className="relative w-56 h-56 md:w-96 md:h-96 rounded-full overflow-hidden ring-4 ring-macu-gold shadow-2xl shadow-black/40 bg-[#f7f7f8]">
            <Image
              src="/macu.png"
              alt="Tejidos Macu"
              fill
              sizes="(min-width: 768px) 384px, 224px"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
