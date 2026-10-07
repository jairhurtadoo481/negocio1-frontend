import Link from "next/link";
import { CATEGORIAS } from "../lib/categorias";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP;

const enlace = "text-macu-cream/70 hover:text-macu-gold text-sm transition";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-macu-navy-dark border-t border-macu-gold/30 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div>
            <h3 className="font-display text-2xl text-macu-cream mb-4">
              Tejidos <span className="text-macu-gold">Macu</span>
            </h3>
            <p className="text-macu-cream/70 text-sm leading-relaxed">
              Tejidos a crochet hechos a mano con cariño. Amigurumis, ramos, flores, llaveros, bolsos y tops, con pedidos personalizados.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-macu-gold mb-4 uppercase tracking-wide text-sm">Categorías</h4>
            <ul className="space-y-2">
              {CATEGORIAS.map((c) => (
                <li key={c.slug}>
                  <Link href={`/${c.slug}`} className={enlace}>
                    {c.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-macu-gold mb-4 uppercase tracking-wide text-sm">Información</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/#como-comprar" className={enlace}>
                  Cómo comprar
                </Link>
              </li>
              <li>
                <Link href="/#politicas" className={enlace}>
                  Entregas y envíos
                </Link>
              </li>
              <li>
                <Link href="/seguimiento" className={enlace}>
                  Seguimiento de pedido
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-macu-gold mb-4 uppercase tracking-wide text-sm">Contacto</h4>
            <ul className="space-y-3 text-sm text-macu-cream/70">
              <li>
                <p className="font-semibold text-macu-cream">Ubicación</p>
                <p>Ica, Perú</p>
              </li>
              <li>
                <p className="font-semibold text-macu-cream">WhatsApp</p>
                <a
                  href={`https://wa.me/${WHATSAPP}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-macu-gold transition"
                >
                  942 713 644
                </a>
              </li>
              <li>
                <p className="font-semibold text-macu-cream">Redes</p>
                <p>@tejidosmacu</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-macu-gold/20 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-macu-cream/60 uppercase tracking-wider">
              © {currentYear} Tejidos Macu. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              <a
                href="https://www.instagram.com/tejidosmacu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-macu-cream/70 hover:text-macu-gold transition text-sm font-semibold"
              >
                Instagram
              </a>
              <a
                href="https://www.facebook.com/tejidosmacu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-macu-cream/70 hover:text-macu-gold transition text-sm font-semibold"
              >
                Facebook
              </a>
              <a
                href="https://www.tiktok.com/@tejidosmacu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-macu-cream/70 hover:text-macu-gold transition text-sm font-semibold"
              >
                TikTok
              </a>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-macu-cream/10 flex justify-center">
            <Link href="/admin/login" className="text-xs text-macu-cream/40 hover:text-macu-cream/70 transition underline">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
