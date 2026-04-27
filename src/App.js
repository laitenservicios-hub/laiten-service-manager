import { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc
} from "firebase/firestore";

function App() {
  const [cliente, setCliente] = useState("");
  const [equipo, setEquipo] = useState("");
  const [problema, setProblema] = useState("");
  const [ordenes, setOrdenes] = useState([]);

  // 🔄 cargar órdenes
  const cargarOrdenes = async () => {
    const data = await getDocs(collection(db, "ordenes"));

    const lista = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id
    }));

    setOrdenes(lista);
  };

  // 💾 crear orden (rápido ⚡)
  const crearOrden = async () => {
    if (!cliente || !equipo || !problema) return;

    const nuevaOrden = {
      cliente,
      equipo,
      problema,
      estado: "pendiente"
    };

    // Mostrar instantáneo
    setOrdenes((prev) => [...prev, { ...nuevaOrden, id: Date.now() }]);

    setCliente("");
    setEquipo("");
    setProblema("");

    try {
      await addDoc(collection(db, "ordenes"), nuevaOrden);
      cargarOrdenes();
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  // 🔄 cambiar estado
  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const ordenRef = doc(db, "ordenes", id);
      await updateDoc(ordenRef, {
        estado: nuevoEstado
      });

      cargarOrdenes();
    } catch (error) {
      console.error("Error al actualizar estado:", error);
    }
  };

  useEffect(() => {
    cargarOrdenes();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Laiten Service Manager</h1>

      <h3>Nueva Orden</h3>

      <input
        placeholder="Cliente"
        value={cliente}
        onChange={(e) => setCliente(e.target.value)}
      />
      <br />

      <input
        placeholder="Equipo"
        value={equipo}
        onChange={(e) => setEquipo(e.target.value)}
      />
      <br />

      <input
        placeholder="Problema"
        value={problema}
        onChange={(e) => setProblema(e.target.value)}
      />
      <br />

      <button onClick={crearOrden}>Crear Orden</button>

      <h3>Órdenes</h3>

      {ordenes.map((o) => (
        <div
          key={o.id}
          style={{
            border: "1px solid gray",
            margin: 5,
            padding: 10,
            borderRadius: 8
          }}
        >
          <p><b>Cliente:</b> {o.cliente}</p>
          <p><b>Equipo:</b> {o.equipo}</p>
          <p><b>Problema:</b> {o.problema}</p>
          <p><b>Estado:</b> {o.estado}</p>

          <button onClick={() => cambiarEstado(o.id, "en proceso")}>
            En proceso
          </button>

          <button onClick={() => cambiarEstado(o.id, "terminado")}>
            Terminado
          </button>

          <button onClick={() => cambiarEstado(o.id, "entregado")}>
            Entregado
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;