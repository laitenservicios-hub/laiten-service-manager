import { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  doc,
  arrayUnion,
  serverTimestamp
} from "firebase/firestore";

function Ordenes({ user }) {
  const EMPRESA_ID = user.uid;

  const [ordenes, setOrdenes] = useState([]);
  const [clientes, setClientes] = useState([]);

  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [equipo, setEquipo] = useState("");
  const [problema, setProblema] = useState("");

  // 🔥 CARGAR DATOS
  useEffect(() => {

    const unsubOrdenes = onSnapshot(collection(db, "ordenes"), (snapshot) => {
      const lista = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(o => o.empresaId === EMPRESA_ID);

      setOrdenes(lista);
    });

    const unsubClientes = onSnapshot(collection(db, "clientes"), (snapshot) => {
      const lista = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(c => c.empresaId === EMPRESA_ID);

      setClientes(lista);
    });

    return () => {
      unsubOrdenes();
      unsubClientes();
    };

  }, [EMPRESA_ID]);

  // 🔥 CREAR ORDEN
  const crearOrden = async () => {
    if (!clienteSeleccionado || !equipo || !problema) return;

    await addDoc(collection(db, "ordenes"), {
      empresaId: EMPRESA_ID,
      cliente: clienteSeleccionado,
      equipo,
      problema,
      estado: "pendiente",
      createdAt: serverTimestamp(),
      history: [{ estado: "pendiente", fecha: new Date() }]
    });

    setEquipo("");
    setProblema("");
  };

  // 🔄 CAMBIAR ESTADO
  const cambiarEstado = async (id, estado) => {
    await updateDoc(doc(db, "ordenes", id), {
      estado,
      history: arrayUnion({ estado, fecha: new Date() })
    });
  };

  return (
    <div>

      <h1 className="text-2xl font-bold mb-6">Órdenes</h1>

      {/* FORM */}
      <div className="bg-white p-4 rounded mb-6 flex gap-2 flex-wrap">

        <select
          className="border p-2"
          value={clienteSeleccionado}
          onChange={(e) => setClienteSeleccionado(e.target.value)}
        >
          <option value="">Cliente</option>
          {clientes.map(c => (
            <option key={c.id}>{c.nombre}</option>
          ))}
        </select>

        <input
          className="border p-2"
          placeholder="Equipo"
          value={equipo}
          onChange={(e) => setEquipo(e.target.value)}
        />

        <input
          className="border p-2"
          placeholder="Problema"
          value={problema}
          onChange={(e) => setProblema(e.target.value)}
        />

        <button
          onClick={crearOrden}
          className="bg-indigo-600 text-white px-4 rounded"
        >
          Crear
        </button>
      </div>

      {/* KANBAN */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        {["pendiente", "en proceso", "terminado", "entregado"].map((estado) => (
          <div key={estado} className="bg-slate-200 p-3 rounded">

            <h3 className="font-bold mb-2 capitalize">{estado}</h3>

            {ordenes
              .filter(o => o.estado === estado)
              .map(o => (
                <div key={o.id} className="bg-white p-3 mb-3 rounded shadow-sm">

                  <p className="font-medium">{o.cliente}</p>
                  <p className="text-sm">{o.equipo}</p>
                  <p className="text-xs text-gray-500">{o.problema}</p>

                  <div className="flex gap-2 mt-2 flex-wrap">

                    <button
                      onClick={() => cambiarEstado(o.id, "en proceso")}
                      className="text-blue-500 text-xs"
                    >
                      Proceso
                    </button>

                    <button
                      onClick={() => cambiarEstado(o.id, "terminado")}
                      className="text-green-500 text-xs"
                    >
                      OK
                    </button>

                    <button
                      onClick={() => cambiarEstado(o.id, "entregado")}
                      className="text-gray-500 text-xs"
                    >
                      Entregado
                    </button>

                  </div>

                </div>
              ))}

          </div>
        ))}

      </div>

    </div>
  );
}

export default Ordenes;