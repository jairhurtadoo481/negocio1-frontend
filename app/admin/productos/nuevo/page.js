"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtegerAdmin from "../../../../components/ProtegerAdmin";
import { crearProducto, subirImagenesProducto, subirVideosProducto } from "../../../../lib/api";
import { obtenerToken } from "../../../../lib/auth";
import { CATEGORIAS } from "../../../../lib/categorias";

const claseInput = "border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-400";

const MAX_VIDEOS = 3;
const MAX_VIDEO_MB = 50;

const formatearTamano = (bytes) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

const formVacio = {
  codigo: "",
  nombre: "",
  modeloBase: "",
  descripcion: "",
  precio: "",
  categoria: CATEGORIAS[0].slug,
  colores: "",
  personalizable: false,
  destacado: false,
};

export default function NuevoProductoPage() {
  const router = useRouter();
  const [form, setForm] = useState(formVacio);
  const [tallas, setTallas] = useState([{ talla: "", stock: "" }]);
  const [imagenes, setImagenes] = useState([]);
  const [videos, setVideos] = useState([]);
  const [etapa, setEtapa] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const duplicado = sessionStorage.getItem("productoDuplicar");
    if (duplicado) {
      const data = JSON.parse(duplicado);
      setForm({
        codigo: data.codigo || "",
        nombre: data.nombre || "",
        modeloBase: data.modeloBase || "",
        descripcion: data.descripcion || "",
        precio: data.precio || "",
        categoria: data.categoria || CATEGORIAS[0].slug,
        colores: data.colores || "",
        personalizable: data.personalizable === true,
        destacado: false,
      });
      if (data.tallas && data.tallas.length > 0) {
        setTallas(data.tallas.map((t) => ({ talla: t.talla, stock: String(t.stock) })));
      }
      setMensaje("Datos copiados de otro producto. Revisa el código, las imágenes y los tamaños antes de guardar.");
      sessionStorage.removeItem("productoDuplicar");
    }
  }, []);

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

  const manejarVideos = (e) => {
    const elegidos = Array.from(e.target.files);
    setError("");

    if (elegidos.length > MAX_VIDEOS) {
      setError(`Puedes subir hasta ${MAX_VIDEOS} videos por producto.`);
      e.target.value = "";
      setVideos([]);
      return;
    }

    const muyPesado = elegidos.find((v) => v.size > MAX_VIDEO_MB * 1024 * 1024);
    if (muyPesado) {
      setError(`"${muyPesado.name}" pesa ${formatearTamano(muyPesado.size)}. Cada video puede pesar hasta ${MAX_VIDEO_MB} MB.`);
      e.target.value = "";
      setVideos([]);
      return;
    }

    setVideos(elegidos);
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");
    setCargando(true);

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
        destacado: form.destacado,
        colores: form.colores
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        tallas: tallasValidas,
      };

      const productoCreado = await crearProducto(token, payload);

      if (imagenes.length > 0) {
        setEtapa("Subiendo imágenes...");
        await subirImagenesProducto(token, productoCreado._id, imagenes);
      }

      if (videos.length > 0) {
        setEtapa("Subiendo videos (puede tardar un poco)...");
        await subirVideosProducto(token, productoCreado._id, videos);
      }

      setMensaje("Producto creado correctamente");
      setForm(formVacio);
      setTallas([{ talla: "", stock: "" }]);
      setImagenes([]);
      setVideos([]);
      e.target.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setEtapa("");
      setCargando(false);
    }
  };

  return (
    <ProtegerAdmin>
      <div className="bg-white min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Crear producto</h1>
            <button
              onClick={() => router.push("/admin/productos")}
              className="text-sm text-gray-600 hover:underline"
            >
              Volver a la lista
            </button>
          </div>

          <form onSubmit={manejarSubmit} className="flex flex-col gap-4">
            <div>
              <input
                name="codigo"
                placeholder="Código (opcional)"
                value={form.codigo}
                onChange={manejarCambio}
                className={`${claseInput} w-full`}
              />
              <p className="text-xs text-gray-400 mt-1">Un número o código propio para ubicar el tejido.</p>
            </div>

            <input
              name="nombre"
              placeholder="Nombre (ej: Ramo Spiderman)"
              value={form.nombre}
              onChange={manejarCambio}
              className={claseInput}
              required
            />

            <div>
              <input
                name="modeloBase"
                placeholder="Modelo base (opcional, para agrupar versiones)"
                value={form.modeloBase}
                onChange={manejarCambio}
                className={`${claseInput} w-full`}
              />
              <p className="text-xs text-gray-400 mt-1">
                Si varios productos comparten el mismo texto aquí, aparecerán como versiones entre sí.
              </p>
            </div>

            <textarea
              name="descripcion"
              placeholder="Descripción (qué incluye: caja, tarjeta, fotos...)"
              value={form.descripcion}
              onChange={manejarCambio}
              className={claseInput}
              rows={3}
            />
            <input
              name="precio"
              type="number"
              placeholder="Precio (S/)"
              value={form.precio}
              onChange={manejarCambio}
              className={claseInput}
              required
            />

            <select
              name="categoria"
              value={form.categoria}
              onChange={manejarCambio}
              className={claseInput}
            >
              {CATEGORIAS.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.nombre}
                </option>
              ))}
            </select>

            <div className="flex flex-col gap-2">
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
                  name="destacado"
                  checked={form.destacado}
                  onChange={manejarCambio}
                />
                Mostrar en Destacados del inicio
              </label>
            </div>

            <input
              name="colores"
              placeholder="Colores (separados por coma)"
              value={form.colores}
              onChange={manejarCambio}
              className={claseInput}
            />

            <div>
              <p className="font-semibold mb-1 text-gray-900">Tamaños y stock</p>
              <p className="text-xs text-gray-400 mb-2">
                Si lo tejes por encargo, pon una cantidad alta (ej. 99) para que siempre se pueda pedir.
              </p>
              {tallas.map((t, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    placeholder="Tamaño (ej: 15cm)"
                    value={t.talla}
                    onChange={(e) => manejarCambioTalla(index, "talla", e.target.value)}
                    className={`${claseInput} flex-1`}
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={t.stock}
                    onChange={(e) => manejarCambioTalla(index, "stock", e.target.value)}
                    className={`${claseInput} w-24`}
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

            <div>
              <p className="font-semibold mb-2 text-gray-900">Imágenes</p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setImagenes(Array.from(e.target.files))}
                className={`${claseInput} w-full`}
              />
              {imagenes.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {imagenes.length} imagen(es) seleccionada(s)
                </p>
              )}
            </div>

            <div>
              <p className="font-semibold mb-1 text-gray-900">Videos (opcional)</p>
              <p className="text-xs text-gray-400 mb-2">
                Hasta {MAX_VIDEOS} videos de {MAX_VIDEO_MB} MB cada uno. Se verán en la página del producto.
              </p>
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={manejarVideos}
                className={`${claseInput} w-full`}
              />
              {videos.length > 0 && (
                <ul className="text-sm text-gray-500 mt-1 list-disc pl-5">
                  {videos.map((v) => (
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
              disabled={cargando}
              className="bg-black text-white rounded py-2 font-semibold hover:bg-gray-800 transition disabled:opacity-50"
            >
              {cargando ? etapa || "Creando..." : "Crear producto"}
            </button>
          </form>
        </div>
      </div>
    </ProtegerAdmin>
  );
}
