import { notFound } from "next/navigation";
import GridCategoria from "../../components/GridCategoria";
import { CATEGORIAS, obtenerCategoria } from "../../lib/categorias";

export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIAS.map((c) => ({ categoria: c.slug }));
}

export async function generateMetadata({ params }) {
  const { categoria } = await params;
  const datos = obtenerCategoria(categoria);
  if (!datos) return {};
  return {
    title: `${datos.nombre} | Tejidos Macu`,
    description: datos.descripcion,
  };
}

export default async function CategoriaPage({ params }) {
  const { categoria } = await params;
  const datos = obtenerCategoria(categoria);
  if (!datos) notFound();

  return <GridCategoria categoria={datos.slug} titulo={datos.nombre} descripcion={datos.descripcion} />;
}
