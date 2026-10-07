import { obtenerProductos } from "../lib/api";
import { CATEGORIAS } from "../lib/categorias";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap() {
  const paginasPrincipales = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...CATEGORIAS.map((c) => ({
      url: `${SITE_URL}/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    })),
  ];

  let paginasProductos = [];
  try {
    const data = await obtenerProductos({ limit: 1000 });
    paginasProductos = (data.productos || []).map((producto) => ({
      url: `${SITE_URL}/producto/${producto._id}`,
      lastModified: new Date(producto.updatedAt || producto.createdAt || Date.now()),
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch (err) {
    console.error("Error generando sitemap de productos:", err);
  }

  return [...paginasPrincipales, ...paginasProductos];
}
