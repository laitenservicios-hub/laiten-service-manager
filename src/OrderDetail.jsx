import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "./firebase";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion
} from "firebase/firestore";

function OrderDetail() {
  const { id } = useParams();

  const [orden, setOrden] = useState(null);
  const [nota, setNota] = useState("");

  const [precio, setPrecio] = useState("");
  const [anticipo, setAnticipo] = useState("");
  const [prioridad, setPrioridad] = useState("");

  useEffect(() => {
    const ref = doc(db, "ordenes", id);

    const unsubscribe = onSnapshot(ref, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        setOrden({ id: docSnap.id, ...data });

        // 🔥 cargar valores actuales en inputs
        setPrecio(data.precio || "");
        setAnticipo(data.anticipo || "");
        setPrioridad(data.prioridad || "");
      }
    });

    return () => unsubscribe();
  }, [id]);

  // 🧠 agregar nota
  const agregarNota = async () => {
    if (!nota) return;

    try {
      const ref = doc(db, "ordenes", id);

      await updateDoc(ref, {
        notas: arrayUnion({
          texto: nota,
          fecha: new Date()
        })
      });

      setNota("");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // 💰 guardar costos
  const guardarCostos = async () => {
    const total = Number(precio);
    const anti = Number(anticipo);
    const restante = total - anti;

    try {
      const ref = doc(db, "ordenes", id);

      await updateDoc(ref, {
        precio: total,
        anticipo: anti,
        restante: restante
      });

    } catch (error) {
      console.error("Error:", error);
    }
  };

  // 🔥 cambiar estado + historial
  const cambiarEstado = async (nuevoEstado) => {
    try {
      const ref = doc(db, "ordenes", id);

      await updateDoc(ref, {
        estado: nuevoEstado,
        history: arrayUnion({
          estado: nuevoEstado,
          fecha: new Date()
        })
      });

    } catch (error) {
      console.error(error);
    }
  };

  // ⚡ guardar prioridad
  const guardarPrioridad = async () => {
    try {
      const ref = doc(db, "ordenes", id);

      await updateDoc(ref, {
        prioridad: prioridad
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (!orden) return <p className="p-6">Cargando...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">

      <Link to="/ordenes" className="text-blue-500">
        ← Volver
      </Link>

      <h2 className="text-2xl font-bold">Detalle de Orden</h2>

      {/* INFO */}
      <div className="bg-white p-4 rounded-xl shadow">
        <p><b>Cliente:</b> {orden.cliente}</p>
        <p><b>Equipo:</b> {orden.equipo}</p>
        <p><b>Problema:</b> {orden.problema}</p>
      </div>

      {/* ESTADO */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-bold mb-2">Estado</h3>

        <p className="mb-2"><b>Actual:</b> {orden.estado}</p>

        <select
          value={orden.estado}
          onChange={(e) => cambiarEstado(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="pendiente">Pendiente</option>
          <option value="en proceso">En proceso</option>
          <option value="terminado">Terminado</option>
          <option value="entregado">Entregado</option>
        </select>
      </div>

      {/* PRIORIDAD */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-bold mb-2">Prioridad</h3>

        <p>
          <b>Actual:</b>{" "}
          <span className={
            orden.prioridad === "alta"
              ? "text-red-500"
              : orden.prioridad === "media"
              ? "text-yellow-500"
              : "text-green-500"
          }>
            {orden.prioridad || "sin definir"}
          </span>
        </p>

        <select
          value={prioridad}
          onChange={(e) => setPrioridad(e.target.value)}
          className="border p-2 rounded w-full mt-2"
        >
          <option value="">Seleccionar</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>

        <button
          onClick={guardarPrioridad}
          className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
        >
          Guardar prioridad
        </button>
      </div>

      {/* COSTOS */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-bold mb-2">Costos</h3>

        <p><b>Total:</b> $ {orden.precio || 0}</p>
        <p><b>Anticipo:</b> $ {orden.anticipo || 0}</p>
        <p><b>Restante:</b> $ {orden.restante || 0}</p>

        <div className="flex gap-2 mt-2">
          <input
            placeholder="Total"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            className="border p-2 rounded w-full"
          />

          <input
            placeholder="Anticipo"
            value={anticipo}
            onChange={(e) => setAnticipo(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        <button
          onClick={guardarCostos}
          className="mt-2 bg-green-500 text-white px-3 py-1 rounded"
        >
          Guardar costos
        </button>
      </div>

      {/* NOTAS */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-bold mb-2">Notas técnicas</h3>

        <div className="flex gap-2">
          <input
            placeholder="Ej: Se cambió pantalla"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            className="border p-2 rounded w-full"
          />

          <button
            onClick={agregarNota}
            className="bg-indigo-500 text-white px-3 rounded"
          >
            +
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {orden.notas?.length ? (
            orden.notas.map((n, i) => (
              <div key={i} className="bg-gray-100 p-2 rounded">
                <p>{n.texto}</p>
                <small className="text-gray-500">
                  {n.fecha?.seconds
                    ? new Date(n.fecha.seconds * 1000).toLocaleString()
                    : new Date(n.fecha).toLocaleString()}
                </small>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No hay notas</p>
          )}
        </div>
      </div>

      {/* HISTORIAL */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-bold mb-2">Historial</h3>

        <div className="space-y-2">
          {orden.history?.length ? (
            orden.history.map((h, i) => (
              <div key={i} className="bg-gray-100 p-2 rounded">
                <p>{h.estado}</p>
                <small className="text-gray-500">
                  {h.fecha?.seconds
                    ? new Date(h.fecha.seconds * 1000).toLocaleString()
                    : new Date(h.fecha).toLocaleString()}
                </small>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Sin historial</p>
          )}
        </div>
      </div>

    </div>
  );
}

export default OrderDetail;