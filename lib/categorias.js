export const CATEGORIAS = [
  {
    slug: "amigurumi",
    nombre: "Amigurumi",
    descripcion: "Personajes tejidos a crochet, hechos a mano y personalizables.",
  },
  {
    slug: "llaveros",
    nombre: "Llaveros",
    descripcion: "Pequeños detalles tejidos para llevar siempre contigo.",
  },
  {
    slug: "flores",
    nombre: "Flores",
    descripcion: "Tulipanes, girasoles y rosas tejidas que nunca se marchitan.",
  },
  {
    slug: "bolsos",
    nombre: "Bolsos",
    descripcion: "Bolsos tejidos con diseños únicos.",
  },
  {
    slug: "tops",
    nombre: "Tops",
    descripcion: "Tops tejidos a crochet para lucir.",
  },
  {
    slug: "ramos",
    nombre: "Ramos",
    descripcion: "Ramos de flores tejidas, con personajes y caja, listos para regalar.",
  },
];

export const obtenerCategoria = (slug) => CATEGORIAS.find((c) => c.slug === slug) || null;

export const nombreCategoria = (slug) => obtenerCategoria(slug)?.nombre || "";
