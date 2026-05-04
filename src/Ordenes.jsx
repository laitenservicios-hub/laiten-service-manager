import { useEffect, useState } from "react";
import { db } from "./firebase";

import {
  collection,
  onSnapshot,
  doc,
  updateDoc
} from "firebase/firestore";

// 🧩 COMPONENTES
import CrearOrden from "./components/CrearOrden";
import OrdersKanban from "./components/OrdersKanban";

export default function Ordenes({ user }) {
  const [ordenes, setOrdenes] = useState([]);

  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(collection(db, "ordenes"), (snapshot) => {
      const lista = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(o => o.empresaId === user.uid);

      setOrdenes(lista);
    });

    return () => unsub();
  }, [user]);

  // 🔄 cambiar estado
  const cambiarEstado = async (id, estado) => {
    try {
      await updateDoc(doc(db, "ordenes", id), {
        estado
      });
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  if (!user) {
    return <p>Cargando usuario...</p>;
  }

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Órdenes</h1>
        <p className="text-gray-500">
          Gestión de órdenes de servicio
        </p>
      </div>

      {/* CREAR ORDEN */}
      <CrearOrden user={user} />

      {/* KANBAN */}
      <OrdersKanban
        ordenes={ordenes}
        onChangeStatus={cambiarEstado}
      />

    </div>
  );
}