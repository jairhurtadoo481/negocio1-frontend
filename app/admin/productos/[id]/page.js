"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ProtegerAdmin from "../../../../components/ProtegerAdmin";
import {
  obtenerProductoPorId,
  actualizarProducto,
  subirImagenesProducto,
  eliminarImagenProducto,
  subirVideosProducto,
  eliminarVideoProducto,
  venderTalla,
} from "../../../../lib/api";
import { obtenerToken } from "../../../../lib/auth";
import { CATEGORIAS } from "../../../../lib/categorias";

const MAX_VIDEOS = 3;
const MAX_VIDEO_MB = 50;

const formatearTamano = (bytes) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

const aInputDatetime = (fecha) => {
  if (!fecha) return "";
  const d = new Date(fecha);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function EditarProductoPage() {
  const router = useRouter();
  const { id } = useParams();

  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    modeloBase: "",
    descripcion: "",
    precio: "",
    categoria: CATEGORIAS[0].slug,
    colores: "",
    personalizable: false,
    destacado: false,
    activo: true,
    precioOferta: "",
    ofertaInicio: "",
    ofertaFin: "",
  });
  const [tallas, setTallas] = useState([{ talla: "", stock: "" }]);
  const [cantidadesVenta, setCantidadesVenta] = useState({});
  const [imagenesActuales, setImagenesActuales] = useState([]);
  const [nuevasImagenes, setNuevasImagenes] = useState([]);
  const [eliminandoImagen, setEliminandoImagen] = useState(null);
  const [videosActuales, setVideosActuales] = useState([]);
  const [nuevosVideos, setNuevosVideos] = useState([]);
  const [eliminandoVideo, setEliminandoVideo] = useState(null);
  const [claveInputVideos, setClaveInputVideos] = useState(0);
  const [etapa, setEtapa] = useState("");
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    try {
      const producto = await obtenerProductoPorId(id);
      setForm({
        codigo: producto.codigo || "",
        nombre: producto.nombre,
        modeloBase: producto.modeloBase || "",
        descripcion: producto.descripcion || "",
        precio: producto.precio,
        categoria: producto.categoria,
        personalizable: producto.personalizable === true,
        colores: (producto.colores || []).join(", "),
        destacado: producto.destacado,
        activo: producto.activo,
        precioOferta: producto.precioOferta ?? "",
        ofertaInicio: aInputDatetime(producto.ofertaInicio),
        ofertaFin: aInputDatetime(producto.ofertaFin),
      });
      setTallas(
        producto.tallas && producto.tallas.length > 0
          ? producto.tallas.map((t) => ({ talla: t.talla, stock: String(t.stock) }))
          : [{ talla: "", stock: "" }]
      );
      setImagenesActuales(producto.imagenes || []);
      setVideosActuales(producto.videos || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargandoDatos(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [id]);

  const manejarCambio = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const manejarCambioTalla = (index, campo, valor) => {
    const nuevasTallas = [...tallas];
    nuevasTallas[index][campo] = valor;
    setTallas(nuevasTallas);
  };

  const agregarTalla = () => {
    setTallas([...tallas, { talla: "", stock: "" }]);
  };

  const quitarTalla = (index) => {
    setTallas(tallas.filter((_, i) => i !== index));
  };

  const manejarEliminarImagen = async (url) => {
    const confirmar = window.confirm("Eliminar esta imagen?");
    if (!confirmar) return;

    setEliminandoImagen(url);
    try {
      const token = obtenerToken();
      await eliminarImagenProducto(token, id, url);
      setImagenesActuales(imagenesActuales.filter((img) => img !== url));
    } catch (err) {
      alert(err.message);
    } finally {
      setEliminandoImagen(null);
    }
  };

  const manejarEliminarVideo = async (url) => {
    const confirmar = window.confirm("¿Eliminar este video?");
    if (!confirmar) return;

    setEliminandoVideo(url);
    try {
      const token = obtenerToken();
      await eliminarVideoProducto(token, id, url);
      setVideosActuales(videosActuales.filter((v) => v !== url));
    } catch (err) {
      alert(err.message);
    } finally {
      setEliminandoVideo(null);
    }
  };

  const manejarVideos = (e) => {
    const elegidos = Array.from(e.target.files);
    setError("");

    if (videosActuales.length + elegidos.length > MAX_VIDEOS) {
      setError(`Cada producto puede tener hasta ${MAX_VIDEOS} videos (ya tiene ${videosActuales.length}).`);
      setClaveInputVideos((c) => c + 1);
      setNuevosVideos([]);
      return;
    }

    const muyPesado = elegidos.find((v) => v.size > MAX_VIDEO_MB * 1024 * 1024);
    if (muyPesado) {
      setError(`"${muyPesado.name}" pesa ${formatearTamano(muyPesado.size)}. Cada video puede pesar hasta ${MAX_VIDEO_MB} MB.`);
      setClaveInputVideos((c) => c + 1);
      setNuevosVideos([]);
      return;
    }

    setNuevosVideos(elegidos);
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");
    setGuardando(true);

    try {
      const token = obtenerToken();

      const tallasValidas = tallas
        .filter((t) => t.talla.trim() !== "" && t.stock !== "")
        .map((t) => ({ talla: t.talla.trim(), stock: Number(t.stock) }));

      const payload = {
        codigo: form.codigo.trim(),
        nombre: form.nombre,
        modeloBase: form.modeloBase.trim(),
        descripcion: form.descripcion,
        precio: Number(form.precio),
        categoria: form.categoria,
        personalizable: form.personalizable,
        colores: form.colores
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        tallas: tallasValidas,
        destacado: form.destacado,
        activo: form.activo,
        precioOferta: form.precioOferta === "" ? null : Number(form.precioOferta),
        ofertaInicio: form.ofertaInicio ? new Date(form.ofertaInicio).toISOString() : null,
        ofertaFin: form.ofertaFin ? new Date(form.ofertaFin).toISOString() : null,
      };

      await actualizarProducto(token, id, payload);

      if (nuevasImagenes.length > 0) {
        setEtapa("Subiendo imágenes...");
        const resultado = await subirImagenesProducto(token, id, nuevasImagenes);
        setImagenesActuales(resultado.imagenes || imagenesActuales);
      }

      if (nuevosVideos.length > 0) {
        setEtapa("Subiendo videos (puede tardar un poco)...");
        const resultado = await subirVideosProducto(token, id, nuevosVideos);
        setVideosActuales(resultado.videos || videosActuales);
        setNuevosVideos([]);
        setClaveInputVideos((c) => c + 1);
      }

      setMensaje("Producto actualizado correctamente");
      setNuevasImagenes([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setEtapa("");
      setGuardando(false);
    }
  };

  const manejarVenta = async (talla) => {
    const cantidad = Number(cantidadesVenta[talla] || 0);
    if (!cantidad || cantidad <= 0) {
      alert("Ingresa una cantidad valida");
      return;
    }

    try {
      const token = obtenerToken();
      await venderTalla(token, id, talla, cantidad);
      setCantidadesVenta({ ...cantidadesVenta, [talla]: "" });
      await cargar();
      setMensaje(`Venta registrada: ${cantidad} unidad(es) de ${talla}`);
    } catch (err) {
      alert(err.message);
    }
  };

  if (cargandoDatos) {
    return <p className="text-center py-16 text-gray-500">Cargando producto...</p>;
  }

  return (
    <ProtegerAdmin>
      <div className="bg-white min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Editar producto</h1>
            <button
              onClick={() => router.push("/admin/productos")}
              className="text-sm text-gray-600 hover:underline"
            >
              Volver a la lista
            </button>
          </div>

          <form onSubmit={manejarSubmit} className="flex flex-col gap-4">
            <input
              name="codigo"
              placeholder="Código (opcional)"
              value={form.codigo}
              onChange={manejarCambio}
              className="border border-gray-300 rounded px-3 py-2 bg-white text-gray-900"
            />

            <input
              name="nombre"
              placeholder="Nombre"
              value={form.nombre}
              onChange={manejarCambio}
              className="border border-gray-300 rounded px-3 py-2 bg-white text-gray-900"
              required
            />
            <input
              name="modeloBase"
              placeholder="Modelo base (opcional, para agrupar versiones)"
              value={form.modeloBase}
              onChange={manejarCambio}
              className="border border-gray-300 rounded px-3 py-2 bg-white text-gray-900"
            />

            <textarea
              name="descripcion"
              placeholder="Descripción (qué incluye: caja, tarjeta, fotos...)"
              value={form.descripcion}
              onChange={manejarCambio}
              className="border border-gray-300 rounded px-3 py-2 bg-white text-gray-900"
              rows={3}
            />
            <input
              name="precio"
              type="number"
              placeholder="Precio"
              value={form.precio}
              onChange={manejarCambio}
              className="border border-gray-300 rounded px-3 py-2 bg-white text-gray-900"
              required
            />

            <select
              name="categoria"
              value={form.categoria}
              onChange={manejarCambio}
              className="border border-gray-300 rounded px-3 py-2 bg-white text-gray-900"
            >
              {CATEGORIAS.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.nombre}
                </option>
              ))}
            </select>

            <input
              name="colores"
              placeholder="Colores (separados por coma)"
              value={form.colores}
              onChange={manejarCambio}
              className="border border-gray-300 rounded px-3 py-2 bg-white text-gray-900"
            />

            <div className="flex gap-6 flex-wrap">
              <label className="flex items-center gap-2 text-sm text-gray-900">
                <input
                  type="checkbox"
                  name="destacado"
                  checked={form.destacado}
                  onChange={manejarCambio}
                />
                Destacado en el inicio
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-900">
                <input
                  type="checkbox"
                  name="personalizable"
                  checked={form.personalizable}
                  onChange={manejarCambio}
                />
                Se puede personalizar
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-900">
                <input
                  type="checkbox"
                  name="activo"
                  checked={form.activo}
                  onChange={manejarCambio}
                />
                Activo (visible en la tienda)
              </label>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <p className="font-semibold mb-3 text-gray-900">Promoción / oferta por tiempo</p>
              <input
                name="precioOferta"
                type="number"
                placeholder="Precio con descuento (dejar vacio para quitar oferta)"
                value={form.precioOferta}
                onChange={manejarCambio}
                className="border border-gray-300 rounded px-3 py-2 w-full mb-3 bg-white text-gray-900"
              />
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Inicio de oferta</label>
                  <input
                    name="ofertaInicio"
                    type="datetime-local"
                    value={form.ofertaInicio}
                    onChange={manejarCambio}
                    className="border border-gray-300 rounded px-3 py-2 w-full bg-white text-gray-900"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Fin de oferta</label>
                  <input
                    name="ofertaFin"
                    type="datetime-local"
                    value={form.ofertaFin}
                    onChange={manejarCambio}
                    className="border border-gray-300 rounded px-3 py-2 w-full bg-white text-gray-900"
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="font-semibold mb-2 text-gray-900">Tamaños y stock</p>
              {tallas.map((t, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    placeholder="Tamaño (ej: 15cm)"
                    value={t.talla}
                    onChange={(e) => manejarCambioTalla(index, "talla", e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 flex-1 bg-white text-gray-900"
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={t.stock}
                    onChange={(e) => manejarCambioTalla(index, "stock", e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 w-24 bg-white text-gray-900"
                  />
                  {tallas.length > 1 && (
                    <button
                      type="button"
                      onClick={() => quitarTalla(index)}
                      className="text-red-600 px-2"
                    >
                      Quitar
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={agregarTalla}
                className="text-sm text-blue-600 hover:underline"
              >
                + Agregar tamaño
              </button>
            </div>

            {imagenesActuales.length > 0 && (
              <div>
                <p className="font-semibold mb-2 text-gray-900">Imágenes actuales</p>
                <div className="flex gap-2 flex-wrap">
                  {imagenesActuales.map((img) => (
                    <div key={img} className="relative">
                      <img
                        src={img}
                        alt="imagen producto"
                        className="w-16 h-16 object-cover rounded border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => manejarEliminarImagen(img)}
                        disabled={eliminandoImagen === img}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-700 transition disabled:opacity-50"
                        title="Eliminar imagen"
                      >
                        {eliminandoImagen === img ? "..." : "x"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="font-semibold mb-2 text-gray-900">Agregar más imágenes</p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setNuevasImagenes(Array.from(e.target.files))}
                className="border border-gray-300 rounded px-3 py-2 w-full bg-white text-gray-900"
              />
            </div>

            {videosActuales.length > 0 && (
              <div>
                <p className="font-semibold mb-2 text-gray-900">Videos actuales</p>
                <div className="flex gap-3 flex-wrap">
                  {videosActuales.map((video) => (
                    <div key={video} className="relative">
                      <video
                        src={video}
                        controls
                        preload="metadata"
                        className="w-24 h-40 object-cover rounded border border-gray-200 bg-black"
                      />
                      <button
                        type="button"
                        onClick={() => manejarEliminarVideo(video)}
                        disabled={eliminandoVideo === video}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-700 transition disabled:opacity-50"
                        title="Eliminar video"
                      >
                        {eliminandoVideo === video ? "..." : "x"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="font-semibold mb-1 text-gray-900">Agregar videos</p>
              <p className="text-xs text-gray-400 mb-2">
                Hasta {MAX_VIDEOS} videos por producto, de {MAX_VIDEO_MB} MB cada uno.
              </p>
              <input
                key={claveInputVideos}
                type="file"
                accept="video/*"
                multiple
                onChange={manejarVideos}
                className="border border-gray-300 rounded px-3 py-2 w-full bg-white text-gray-900"
              />
              {nuevosVideos.length > 0 && (
                <ul className="text-sm text-gray-500 mt-1 list-disc pl-5">
                  {nuevosVideos.map((v) => (
                    <li key={v.name}>
                      {v.name} ({formatearTamano(v.size)})
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {mensaje && <p className="text-green-600 text-sm">{mensaje}</p>}
            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={guardando}
              className="bg-black text-white rounded py-2 font-semibold hover:bg-gray-800 transition disabled:opacity-50"
            >
              {guardando ? etapa || "Guardando..." : "Guardar cambios"}
            </button>
          </form>

          <div className="mt-10 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Registrar venta rápida</h2>
            {tallas
              .filter((t) => t.talla.trim() !== "")
              .map((t) => (
                <div key={t.talla} className="flex items-center gap-3 mb-2">
                  <span className="w-20 text-sm font-medium text-gray-900">{t.talla}</span>
                  <span className="text-sm text-gray-500 w-24">Stock: {t.stock}</span>
                  <input
                    type="number"
                    placeholder="Cantidad"
                    value={cantidadesVenta[t.talla] || ""}
                    onChange={(e) =>
                      setCantidadesVenta({ ...cantidadesVenta, [t.talla]: e.target.value })
                    }
                    className="border border-gray-300 rounded px-3 py-1 w-24 text-sm bg-white text-gray-900"
                  />
                  <button
                    onClick={() => manejarVenta(t.talla)}
                    className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                  >
                    Vender
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </ProtegerAdmin>
  );
}