"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProtegerAdmin from "../../../components/ProtegerAdmin";
import { obtenerProductos, eliminarProducto } from "../../../lib/api";
import { obtenerToken } from "../../../lib/auth";
import { CATEGORIAS, nombreCategoria } from "../../../lib/categorias";

const categorias = [
  { valor: "todos", etiqueta: "Todos" },
  ...CATEGORIAS.map((c) => ({ valor: c.slug, etiqueta: c.nombre })),
];

export default function AdminProductosPage() {
  const router = useRouter();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  const cargarProductos = async () => {
    setCargando(true);
    try {
      const data = await obtenerProductos({ limit: 1000 });
      setProductos(data.productos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const manejarEliminar = async (id, nombre) => {
    const confirmar = window.confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`);
    if (!confirmar) return;

    try {
      const token = obtenerToken();
      await eliminarProducto(token, id);
      setProductos(productos.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const manejarDuplicar = (producto) => {
    const copia = {
      codigo: "",
      nombre: producto.nombre,
      modeloBase: producto.modeloBase || "",
      descripcion: producto.descripcion || "",
      precio: producto.precio,
      categoria: producto.categoria,
      personalizable: producto.personalizable === true,
      colores: (producto.colores || []).join(", "),
      tallas: producto.tallas || [],
    };
    sessionStorage.setItem("productoDuplicar", JSON.stringify(copia));
    router.push("/admin/productos/nuevo");
  };

  const productosFiltrados = productos.filter((p) => {
    if (filtroCategoria !== "todos" && p.categoria !== filtroCategoria) return false;
    if (busqueda.trim()) {
      const termino = busqueda.trim().toLowerCase();
      const coincideCodigo = p.codigo && p.codigo.toLowerCase().includes(termino);
      const coincideNombre = p.nombre.toLowerCase().includes(termino);
      if (!coincideCodigo && !coincideNombre) return false;
    }
    return true;
  });

  const contarPorCategoria = (categoria) => {
    if (categoria === "todos") return productos.length;
    return productos.filter((p) => p.categoria === categoria).length;
  };

  return (
    <ProtegerAdmin>
      <div className="bg-white min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Gestión de productos</h1>
            <Link
              href="/admin/productos/nuevo"
              className="text-sm bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
            >
              + Nuevo producto
            </Link>
          </div>

          <div className="flex gap-2 mb-3 flex-wrap">
            {categorias.map((c) => (
              <button
                key={c.valor}
                onClick={() => setFiltroCategoria(c.valor)}
                className={`text-sm px-4 py-2 rounded-full border transition ${
                  filtroCategoria === c.valor
                    ? "bg-black text-white border-black"
                    : "border-gray-300 text-gray-600 hover:border-black bg-white"
                }`}
              >
                {c.etiqueta} ({contarPorCategoria(c.valor)})
              </button>
            ))}
          </div>

          <div className="flex gap-2 mb-4 flex-wrap items-center">
            <input
              type="text"
              placeholder="Buscar por código o nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="text-sm border border-gray-300 rounded px-3 py-2 flex-1 min-w-[200px] bg-white text-gray-900 placeholder-gray-400"
            />
          </div>

          {cargando && <p className="text-gray-500">Cargando...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {!cargando && productosFiltrados.length === 0 && (
            <p className="text-gray-500">No hay productos con estos filtros.</p>
          )}

          <div className="flex flex-col gap-3">
            {productosFiltrados.map((producto) => (
              <div
                key={producto._id}
                className="border border-gray-200 rounded-lg p-4 flex items-center gap-4 bg-white"
              >
                <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  {producto.imagenes && producto.imagenes.length > 0 ? (
                    <img
                      src={producto.imagenes[0]}
                      alt={producto.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                      Sin imagen
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {producto.codigo && (
                      <span className="text-xs bg-black text-white px-2 py-0.5 rounded font-bold">
                        #{producto.codigo}
                      </span>
                    )}
                    {producto.destacado && (
                      <span className="text-xs bg-yellow-200 text-yellow-900 px-2 py-0.5 rounded">Destacado</span>
                    )}
                    {producto.personalizable && (
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">Personalizable</span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-900">{producto.nombre}</p>
                  <p className="text-sm text-gray-500">
                    {nombreCategoria(producto.categoria)} - S/ {producto.precio}
                  </p>
                </div>

                <div className="flex gap-3 text-sm">
                  <Link
                    href={`/admin/productos/${producto._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => manejarDuplicar(producto)}
                    className="text-purple-600 hover:underline"
                  >
                    Duplicar
                  </button>
                  <button
                    onClick={() => manejarEliminar(producto._id, producto.nombre)}
                    className="text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProtegerAdmin>
  );
}
