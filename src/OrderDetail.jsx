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
        setOrden({ id: docSnap.id, ...docSnap.data() });
      }
    });

    return () => unsubscribe();
  }, [id]);

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

      setPrecio("");
      setAnticipo("");
    } catch (error) {
      console.error("Error:", error);
    }
  };

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

  if (!orden) return <p>Cargando...</p>;

  return (
    <div style={{ padding: 20 }}>
      <Link to="/">← Volver</Link>

      <h2>Detalle de Orden</h2>

      <p><b>Cliente:</b> {orden.cliente}</p>
      <p><b>Equipo:</b> {orden.equipo}</p>
      <p><b>Problema:</b> {orden.problema}</p>
      <p><b>Estado:</b> {orden.estado}</p>

      <h3>Prioridad</h3>

      <p><b>Actual:</b> {orden.prioridad}</p>

      <select
        value={prioridad}
        onChange={(e) => setPrioridad(e.target.value)}
      >
        <option value="">Seleccionar</option>
        <option value="alta">Alta</option>
        <option value="media">Media</option>
        <option value="baja">Baja</option>
      </select>

      <button onClick={guardarPrioridad}>
        Guardar prioridad
      </button>

      <h3>Costos</h3>

      <p><b>Total:</b> $ {orden.precio}</p>
      <p><b>Anticipo:</b> $ {orden.anticipo}</p>
      <p><b>Restante:</b> $ {orden.restante}</p>

      <input placeholder="Total" value={precio} onChange={(e) => setPrecio(e.target.value)} />
      <input placeholder="Anticipo" value={anticipo} onChange={(e) => setAnticipo(e.target.value)} />
      <button onClick={guardarCostos}>Guardar costos</button>

      <h3>Agregar nota técnica</h3>

      <input
        placeholder="Ej: Se cambió pantalla"
        value={nota}
        onChange={(e) => setNota(e.target.value)}
      />

      <button onClick={agregarNota}>Guardar nota</button>

      <h3>Notas</h3>

      {orden.notas?.length ? (
        orden.notas.map((n, i) => (
          <div key={i}>
            <p>{n.texto}</p>
            <small>{new Date(n.fecha).toLocaleString()}</small>
          </div>
        ))
      ) : (
        <p>No hay notas</p>
      )}

      <h3>Historial</h3>

      {orden.history?.map((h, i) => (
        <div key={i}>
          <p>{h.estado}</p>
          <small>{new Date(h.fecha).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}

export default OrderDetail;