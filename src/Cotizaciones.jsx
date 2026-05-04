import { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";

function Cotizaciones({ user }) {
  const EMPRESA_ID = user.uid;

  const [cotizaciones, setCotizaciones] = useState([]);
  const [clientes, setClientes] = useState([]);

  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [equipo, setEquipo] = useState("");
  const [problema, setProblema] = useState("");
  const [precio, setPrecio] = useState("");

  // 🔥 CARGAR DATOS
  useEffect(() => {

    const unsubCot = onSnapshot(collection(db, "cotizaciones"), (snapshot) => {
      const lista = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(c => c.empresaId === EMPRESA_ID);

      setCotizaciones(lista);
    });

    const unsubClientes = onSnapshot(collection(db, "clientes"), (snapshot) => {
      const lista = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(c => c.empresaId === EMPRESA_ID);

      setClientes(lista);
    });

    return () => {
      unsubCot();
      unsubClientes();
    };

  }, [EMPRESA_ID]);

  // 🔥 CREAR
  const crearCotizacion = async () => {
    if (!clienteSeleccionado || !equipo || !problema || !precio) return;

    await addDoc(collection(db, "cotizaciones"), {
      empresaId: EMPRESA_ID,
      cliente: clienteSeleccionado,
      equipo,
      problema,
      precio,
      estado: "pendiente",
      createdAt: serverTimestamp()
    });

    setEquipo("");
    setProblema("");
    setPrecio("");
  };

  // 🔄 CONVERTIR A ORDEN
  const convertirAOrden = async (cot) => {

    await addDoc(collection(db, "ordenes"), {
      empresaId: EMPRESA_ID,
      cliente: cot.cliente,
      equipo: cot.equipo,
      problema: cot.problema,
      estado: "pendiente",
      createdAt: serverTimestamp()
    });

    await updateDoc(doc(db, "cotizaciones", cot.id), {
      estado: "aceptada"
    });
  };

  return (
    <div>

      <h1 className="text-2xl font-bold mb-6">Cotizaciones</h1>

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

        <input
          className="border p-2"
          placeholder="Precio"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
        />

        <button
          onClick={crearCotizacion}
          className="bg-yellow-500 text-white px-4 rounded"
        >
          Crear
        </button>
      </div>

      {/* LISTA */}
      <div className="bg-white p-4 rounded">
        <h2 className="font-bold mb-4">Lista</h2>

        {cotizaciones.map(c => (
          <div key={c.id} className="border-b py-3 flex justify-between items-center">

            <div>
              <p className="font-medium">{c.cliente}</p>
              <p className="text-sm">{c.equipo}</p>
              <p className="text-xs text-gray-500">{c.problema}</p>
              <p className="text-sm font-bold">${c.precio}</p>
            </div>

            {c.estado !== "aceptada" && (
              <button
                onClick={() => convertirAOrden(c)}
                className="text-green-600 text-sm"
              >
                Convertir
              </button>
            )}

          </div>
        ))}

      </div>

    </div>
  );
}

export default Cotizaciones;