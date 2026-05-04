import { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, onSnapshot } from "firebase/firestore";

function Clientes({ user }) {
  const EMPRESA_ID = user.uid;

  const [clientes, setClientes] = useState([]);
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "clientes"), (snapshot) => {
      const lista = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(c => c.empresaId === EMPRESA_ID);

      setClientes(lista);
    });

    return () => unsub();
  }, [EMPRESA_ID]);

  const crearCliente = async () => {
    if (!nombre) return;

    await addDoc(collection(db, "clientes"), {
      empresaId: EMPRESA_ID,
      nombre
    });

    setNombre("");
  };

  return (
    <div>

      <h1 className="text-2xl font-bold mb-6">Clientes</h1>

      {/* CREAR */}
      <div className="bg-white p-4 rounded mb-6 flex gap-2">
        <input
          className="border p-2 flex-1"
          placeholder="Nombre del cliente"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <button
          onClick={crearCliente}
          className="bg-indigo-600 text-white px-4 rounded"
        >
          Crear
        </button>
      </div>

      {/* LISTA */}
      <div className="bg-white p-4 rounded">
        <h2 className="font-bold mb-4">Lista</h2>

        {clientes.map(c => (
          <div key={c.id} className="border-b py-2">
            {c.nombre}
          </div>
        ))}
      </div>

    </div>
  );
}

export default Clientes;