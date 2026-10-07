"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import ProtegerAdmin from "../../../components/ProtegerAdmin";
import {
  obtenerReservas,
  obtenerVentas,
  obtenerProductos,
  registrarVenta,
  eliminarVenta,
  eliminarReserva,
} from "../../../lib/api";
import { obtenerToken } from "../../../lib/auth";

const formatearFecha = (fecha) => {
  const d = new Date(fecha);
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const formatearHora = (fecha) => {
  const d = new Date(fecha);
  return d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
};

const nombreMetodo = { yape: "Yape", plin: "Plin" };
const ORIGEN_WEB = "Compra web";
const ORIGEN_DIRECTA = "Venta directa";
const COLORES = ["#273e60", "#e9b84a", "#35527f", "#f97316"];

const esHoy = (fecha) => new Date(fecha).toDateString() === new Date().toDateString();

const inicioSemana = () => {
  const hoy = new Date();
  const dia = hoy.getDay();
  const diff = hoy.getDate() - dia + (dia === 0 ? -6 : 1);
  const lunes = new Date(hoy.setDate(diff));
  lunes.setHours(0, 0, 0, 0);
  return lunes;
};

const inicioMes = () => {
  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth(), 1);
};

const ultimos7Dias = () => {
  const dias = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    dias.push(d);
  }
  return dias;
};

const descargarCSV = (filas) => {
  const encabezados = ["Fecha", "Hora", "Origen", "Cliente", "Método", "Código", "Producto", "Cantidad", "Descuento", "Subtotal"];
  const filasCSV = filas.map((f) => [
    formatearFecha(f.fecha),
    formatearHora(f.fecha),
    f.origen,
    `"${f.cliente.replace(/"/g, '""')}"`,
    f.metodo,
    f.codigo,
    `"${f.nombre.replace(/"/g, '""')}"`,
    f.cantidad,
    f.descuento,
    f.subtotal,
  ]);

  const csv = [encabezados.join(","), ...filasCSV.map((fila) => fila.join(","))].join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `ventas_${new Date().toISOString().slice(0, 10)}.csv`;
  enlace.click();
  URL.revokeObjectURL(url);
};

export default function VentasPage() {
  const [filas, setFilas] = useState([]);
  const [itemsDetalle, setItemsDetalle] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [catalogo, setCatalogo] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [productoElegido, setProductoElegido] = useState(null);
  const [tallaElegida, setTallaElegida] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [descuento, setDescuento] = useState("");
  const [errorModal, setErrorModal] = useState("");
  const [registrando, setRegistrando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);

  const cargarTodo = async () => {
    setCargando(true);
    try {
      const token = obtenerToken();
      const [reservas, ventas] = await Promise.all([
        obtenerReservas(token, true),
        obtenerVentas(token),
      ]);

      const filasExpandidas = [];
      const itemsExpandidos = [];

      reservas.forEach((reserva) => {
        const productosTexto = reserva.items
          .map((item) => `${item.nombre} (${item.talla} x${item.cantidad})`)
          .join(", ");
        const codigosTexto = reserva.items
          .map((item) => item.codigo)
          .filter(Boolean)
          .map((c) => `#${c}`)
          .join(", ");
        const cantidadTotal = reserva.items.reduce((acc, item) => acc + item.cantidad, 0);

        filasExpandidas.push({
          id: reserva._id,
          tipo: "reserva",
          origen: ORIGEN_WEB,
          metodo: nombreMetodo[reserva.metodoPago] || "-",
          fecha: reserva.updatedAt,
          codigo: codigosTexto || "-",
          nombre: productosTexto,
          cantidad: cantidadTotal,
          descuento: 0,
          subtotal: reserva.total,
          cliente: reserva.cliente.nombre,
        });

        reserva.items.forEach((item) => {
          itemsExpandidos.push({
            origen: ORIGEN_WEB,
            nombre: item.nombre,
            cantidad: item.cantidad,
            subtotal: item.precioUnitario * item.cantidad,
          });
        });
      });

      ventas.forEach((venta) => {
        const subtotal = venta.precioUnitario * venta.cantidad - (venta.descuento || 0);

        filasExpandidas.push({
          id: venta._id,
          tipo: "venta",
          origen: ORIGEN_DIRECTA,
          metodo: "-",
          fecha: venta.createdAt,
          codigo: venta.codigo ? `#${venta.codigo}` : "-",
          nombre: `${venta.nombre} (${venta.talla} x${venta.cantidad})`,
          cantidad: venta.cantidad,
          descuento: venta.descuento || 0,
          subtotal,
          cliente: "-",
        });

        itemsExpandidos.push({
          origen: ORIGEN_DIRECTA,
          nombre: venta.nombre,
          cantidad: venta.cantidad,
          subtotal,
        });
      });

      filasExpandidas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setFilas(filasExpandidas);
      setItemsDetalle(itemsExpandidos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTodo();
  }, []);

  const abrirModal = async () => {
    setModalAbierto(true);
    if (catalogo.length > 0) return;
    try {
      const data = await obtenerProductos({ limit: 1000 });
      setCatalogo(data.productos);
    } catch (err) {
      setErrorModal(err.message);
    }
  };

  const elegirProducto = (producto) => {
    setProductoElegido(producto);
    setTallaElegida("");
    setCantidad(1);
    setDescuento("");
    setErrorModal("");
  };

  const confirmarVenta = async () => {
    if (!tallaElegida) {
      setErrorModal("Selecciona un tamaño");
      return;
    }

    setRegistrando(true);
    setErrorModal("");

    try {
      const token = obtenerToken();
      await registrarVenta(token, productoElegido._id, tallaElegida, Number(cantidad), Number(descuento) || 0);
      cerrarModal();
      cargarTodo();
    } catch (err) {
      setErrorModal(err.message);
    } finally {
      setRegistrando(false);
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setBusqueda("");
    setProductoElegido(null);
    setTallaElegida("");
    setCantidad(1);
    setDescuento("");
    setErrorModal("");
  };

  const manejarEliminarVenta = async (id, nombre) => {
    const confirmar = window.confirm(`¿Eliminar esta venta (${nombre})? El stock se va a restaurar automáticamente.`);
    if (!confirmar) return;

    setEliminandoId(id);
    try {
      const token = obtenerToken();
      await eliminarVenta(token, id);
      cargarTodo();
    } catch (err) {
      alert(err.message);
    } finally {
      setEliminandoId(null);
    }
  };

  const manejarEliminarReserva = async (id, nombre) => {
    const confirmar = window.confirm(`¿Eliminar esta compra web (${nombre}) por completo?`);
    if (!confirmar) return;

    setEliminandoId(id);
    try {
      const token = obtenerToken();
      await eliminarReserva(token, id);
      cargarTodo();
    } catch (err) {
      alert(err.message);
    } finally {
      setEliminandoId(null);
    }
  };

  const totalGeneral = filas.reduce((acc, f) => acc + f.subtotal, 0);

  const totalConDescuento = productoElegido
    ? productoElegido.precio * cantidad - (Number(descuento) || 0)
    : 0;

  const totalHoy = filas.filter((f) => esHoy(f.fecha)).reduce((acc, f) => acc + f.subtotal, 0);
  const totalSemana = filas
    .filter((f) => new Date(f.fecha) >= inicioSemana())
    .reduce((acc, f) => acc + f.subtotal, 0);
  const totalMes = filas
    .filter((f) => new Date(f.fecha) >= inicioMes())
    .reduce((acc, f) => acc + f.subtotal, 0);

  const datosGrafico = ultimos7Dias().map((dia) => {
    const total = filas
      .filter((f) => new Date(f.fecha).toDateString() === dia.toDateString())
      .reduce((acc, f) => acc + f.subtotal, 0);
    return {
      dia: dia.toLocaleDateString("es-PE", { weekday: "short", day: "numeric" }),
      total,
    };
  });

  const topProductos = Object.values(
    itemsDetalle.reduce((acc, item) => {
      if (!acc[item.nombre]) acc[item.nombre] = { nombre: item.nombre, cantidad: 0, total: 0 };
      acc[item.nombre].cantidad += item.cantidad;
      acc[item.nombre].total += item.subtotal;
      return acc;
    }, {})
  )
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);

  const datosOrigen = [ORIGEN_WEB, ORIGEN_DIRECTA].map((origen) => ({
    name: origen,
    value: itemsDetalle.filter((i) => i.origen === origen).reduce((acc, i) => acc + i.subtotal, 0),
  }));

  const termino = busqueda.trim().toLowerCase();
  const resultadosBusqueda = termino
    ? catalogo
        .filter((p) => p.nombre.toLowerCase().includes(termino) || (p.codigo && p.codigo.toLowerCase().includes(termino)))
        .slice(0, 6)
    : [];

  return (
    <ProtegerAdmin>
      <div className="bg-white min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-10 text-gray-900">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h1 className="text-2xl font-bold">Ventas</h1>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => descargarCSV(filas)}
                className="text-sm bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition"
              >
                Exportar CSV
              </button>
              <button
                onClick={abrirModal}
                className="text-sm bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
              >
                + Agregar venta
              </button>
              <Link href="/admin/reservas" className="text-sm text-blue-600 hover:underline self-center">
                Volver a compras
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="border border-gray-200 rounded-lg p-4 bg-white text-center">
              <p className="text-xs text-gray-500">Hoy</p>
              <p className="text-xl font-bold">S/ {totalHoy}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 bg-white text-center">
              <p className="text-xs text-gray-500">Esta semana</p>
              <p className="text-xl font-bold">S/ {totalSemana}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 bg-white text-center">
              <p className="text-xs text-gray-500">Este mes</p>
              <p className="text-xl font-bold">S/ {totalMes}</p>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 bg-white mb-6">
            <p className="font-semibold mb-3 text-sm">Ventas de los últimos 7 días</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={datosGrafico}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [`S/ ${value}`, "Total"]} />
                <Bar dataKey="total" fill="#273e60" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <p className="font-semibold mb-3 text-sm">Compra web vs Venta directa</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={datosOrigen} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                    {datosOrigen.map((entry, index) => (
                      <Cell key={index} fill={COLORES[index % COLORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `S/ ${value}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <p className="font-semibold mb-3 text-sm">Top 5 tejidos más vendidos</p>
              {topProductos.length === 0 && <p className="text-xs text-gray-400">Sin datos aún.</p>}
              <div className="flex flex-col gap-2">
                {topProductos.map((p, i) => (
                  <div key={p.nombre} className="flex items-center justify-between text-sm">
                    <span>{i + 1}. {p.nombre}</span>
                    <span className="font-semibold">{p.cantidad} vendidos</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 text-xs text-gray-500 mb-4">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-blue-200 border border-blue-400 inline-block"></span> Compra web
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-green-200 border border-green-400 inline-block"></span> Venta directa
            </span>
          </div>

          {cargando && <p className="text-gray-500">Cargando...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {!cargando && filas.length === 0 && (
            <p className="text-gray-500">Aún no hay ventas registradas.</p>
          )}

          {filas.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-300 rounded-lg overflow-hidden">
                  <thead className="bg-gray-800 text-white text-left">
                    <tr>
                      <th className="p-2">Fecha</th>
                      <th className="p-2">Hora</th>
                      <th className="p-2">Origen</th>
                      <th className="p-2">Cliente</th>
                      <th className="p-2">Método</th>
                      <th className="p-2">Código</th>
                      <th className="p-2">Producto(s)</th>
                      <th className="p-2">Cant.</th>
                      <th className="p-2">Descuento</th>
                      <th className="p-2">Subtotal</th>
                      <th className="p-2">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filas.map((f, i) => (
                      <tr
                        key={i}
                        className={`border-t border-gray-300 align-top border-l-4 font-medium ${
                          f.origen === ORIGEN_WEB ? "bg-blue-200 border-l-blue-700" : "bg-green-200 border-l-green-700"
                        }`}
                      >
                        <td className="p-2">{formatearFecha(f.fecha)}</td>
                        <td className="p-2">{formatearHora(f.fecha)}</td>
                        <td className="p-2">{f.origen}</td>
                        <td className="p-2">{f.cliente}</td>
                        <td className="p-2">{f.metodo}</td>
                        <td className="p-2">{f.codigo}</td>
                        <td className="p-2">{f.nombre}</td>
                        <td className="p-2">{f.cantidad}</td>
                        <td className="p-2">
                          {f.descuento > 0 ? (
                            <span className="text-red-700">- S/ {f.descuento}</span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="p-2 font-bold">S/ {f.subtotal}</td>
                        <td className="p-2">
                          <button
                            onClick={() =>
                              f.tipo === "venta"
                                ? manejarEliminarVenta(f.id, f.nombre)
                                : manejarEliminarReserva(f.id, f.nombre)
                            }
                            disabled={eliminandoId === f.id}
                            className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition disabled:opacity-50"
                          >
                            {eliminandoId === f.id ? "..." : "Eliminar"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 text-right">
                <span className="text-lg font-bold">Total vendido: S/ {totalGeneral}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {modalAbierto && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={cerrarModal}
        >
          <div
            className="bg-white text-gray-900 rounded-lg max-w-sm w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-1">Agregar venta directa</h2>
            <p className="text-xs text-gray-500 mb-4">
              Para ventas que cerraste por WhatsApp, Instagram o en persona. Descuenta el stock automáticamente.
            </p>

            {!productoElegido && (
              <>
                <input
                  type="text"
                  placeholder="Buscar tejido por nombre o código"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 w-full mb-3"
                  autoFocus
                />
                <div className="flex flex-col gap-2">
                  {resultadosBusqueda.map((p) => (
                    <button
                      key={p._id}
                      onClick={() => elegirProducto(p)}
                      className="flex items-center gap-3 border border-gray-200 rounded p-2 text-left hover:bg-gray-50"
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {p.imagenes?.[0] && (
                          <img src={p.imagenes[0]} alt={p.nombre} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{p.nombre}</p>
                        <p className="text-xs text-gray-500">
                          {p.codigo ? `#${p.codigo} - ` : ""}S/ {p.precio}
                        </p>
                      </div>
                    </button>
                  ))}
                  {termino && resultadosBusqueda.length === 0 && (
                    <p className="text-sm text-gray-500">No se encontró ningún tejido.</p>
                  )}
                </div>
              </>
            )}

            {errorModal && <p className="text-red-600 text-sm mt-3">{errorModal}</p>}

            {productoElegido && (
              <div className="border border-gray-200 rounded p-3 mb-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {productoElegido.imagenes?.[0] ? (
                      <img
                        src={productoElegido.imagenes[0]}
                        alt={productoElegido.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        Sin foto
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{productoElegido.nombre}</p>
                    <p className="text-xs text-gray-500">S/ {productoElegido.precio}</p>
                  </div>
                  <button
                    onClick={() => setProductoElegido(null)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Cambiar
                  </button>
                </div>

                <p className="text-xs font-semibold mb-1">Tamaño</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {productoElegido.tallas
                    .filter((t) => t.stock > 0)
                    .map((t) => (
                      <button
                        key={t.talla}
                        onClick={() => setTallaElegida(t.talla)}
                        className={`text-xs border rounded px-2 py-1 ${
                          tallaElegida === t.talla ? "bg-black text-white border-black" : "border-gray-300"
                        }`}
                      >
                        {t.talla} (stock {t.stock})
                      </button>
                    ))}
                  {productoElegido.tallas.filter((t) => t.stock > 0).length === 0 && (
                    <p className="text-xs text-gray-500">Este tejido no tiene stock. Edita el producto para agregarlo.</p>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <p className="text-xs font-semibold">Cantidad</p>
                  <input
                    type="number"
                    min="1"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 w-20 text-sm"
                  />
                </div>

                <div className="mb-3">
                  <p className="text-xs font-semibold mb-1">Descuento en S/ (opcional)</p>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ej: 5, 10..."
                    value={descuento}
                    onChange={(e) => setDescuento(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                  />
                </div>

                <p className="text-sm font-bold mb-3">
                  Total a cobrar: S/ {totalConDescuento >= 0 ? totalConDescuento : 0}
                </p>

                <button
                  onClick={confirmarVenta}
                  disabled={registrando}
                  className="w-full bg-green-600 text-white rounded py-2 text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50"
                >
                  {registrando ? "Registrando..." : "Confirmar venta"}
                </button>
              </div>
            )}

            <button onClick={cerrarModal} className="text-sm text-gray-500 hover:underline w-full text-center mt-2">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </ProtegerAdmin>
  );
}
