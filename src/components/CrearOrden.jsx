import { useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs
} from "firebase/firestore";

export default function CrearOrden({ user }) {
  const [cliente, setCliente] = useState("");
  const [equipo, setEquipo] = useState("");
  const [problema, setProblema] = useState("");
  const [loading, setLoading] = useState(false);

  const crearOrden = async () => {
    console.log("CLICK");

    if (loading) return;

    // 🔒 validar usuario
    if (!user || !user.uid) {
      alert("Usuario no listo");
      return;
    }

    // 🔥 validaciones UX
    if (!cliente) {
      alert("Selecciona un cliente");
      return;
    }

    if (!equipo) {
      alert("Ingresa el equipo");
      return;
    }

    if (!problema) {
      alert("Describe el problema");
      return;
    }

    try {
      setLoading(true);

      // 🔥 obtener órdenes del usuario
      const snapshot = await getDocs(collection(db, "ordenes"));

      const ordenesUsuario = snapshot.docs
        .map(doc => doc.data())
        .filter(o => o.empresaId === user.uid);

      // 🔥 generar folio
      const numero = ordenesUsuario.length + 1;
      const folio = `ORD-${String(numero).padStart(4, "0")}`;

      console.log("Folio generado:", folio);

      // 💾 guardar en Firebase
      await addDoc(collection(db, "ordenes"), {
        folio,
        cliente,
        equipo,
        problema,

        estado: "pendiente",
        prioridad: "media",

        precio: 0,
        anticipo: 0,
        restante: 0,

        notas: [],
        history: [],

        empresaId: user.uid,
        createdAt: serverTimestamp()
      });

      alert(`Orden creada 🚀 (${folio})`);

      // 🧹 limpiar
      setCliente("");
      setEquipo("");
      setProblema("");

    } catch (error) {
      console.error("🔥 ERROR:", error);
      alert("Error al crear orden");
    } finally {
      setLoading(false);
    }
  };

  // 🔒 evitar render sin user
  if (!user) {
    return (
      <div className="bg-white p-4 rounded-xl shadow mb-4">
        <p className="text-gray-500">Cargando usuario...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow mb-4">
      <h3 className="font-bold mb-2">Crear Orden</h3>

      <div className="flex flex-col md:flex-row gap-2">

        <input
          placeholder="Cliente"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <input
          placeholder="Equipo"
          value={equipo}
          onChange={(e) => setEquipo(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <input
          placeholder="Problema"
          value={problema}
          onChange={(e) => setProblema(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <button
          onClick={crearOrden}
          disabled={loading}
          className="bg-blue-600 text-white px-4 rounded"
        >
          {loading ? "Creando..." : "Crear"}
        </button>

      </div>
    </div>
  );
}