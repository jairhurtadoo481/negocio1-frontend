export default function BotonWhatsapp({ producto }) {
  const numero = process.env.NEXT_PUBLIC_WHATSAPP;
  const mensaje = encodeURIComponent(
    `Hola! Me interesa "${producto.nombre}" que vi en Tejidos Macu. ¿Está disponible?`
  );
  const link = `https://wa.me/${numero}?text=${mensaje}`;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 bg-green-600 text-white rounded-full py-2 font-semibold hover:bg-green-700 transition mt-4 w-full"
    >
      Preguntar por WhatsApp
    </a>
  );
}
