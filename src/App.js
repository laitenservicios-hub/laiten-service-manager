import { useState, useEffect } from "react";
import { auth, db } from "./firebase";

import {
  collection,
  onSnapshot
} from "firebase/firestore";

import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";

import { onAuthStateChanged } from "firebase/auth";

// 🔹 PÁGINAS
import Clientes from "./Clientes";
import Cotizaciones from "./Cotizaciones";
import Ordenes from "./Ordenes";

// 🔹 UI
import Login from "./Login";
import Layout from "./Layout";

// 📊 GRÁFICA
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function Home({ user }) {
  const EMPRESA_ID = user.uid;

  const [ordenes, setOrdenes] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [clientes, setClientes] = useState([]);

  useEffect(() => {

    const unsubOrdenes = onSnapshot(collection(db, "ordenes"), (snapshot) => {
      const lista = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(o => o.empresaId === EMPRESA_ID);

      setOrdenes(lista);
    });

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
      unsubOrdenes();
      unsubCot();
      unsubClientes();
    };

  }, [EMPRESA_ID]);

  // 📊 MÉTRICAS
  const pendientes = ordenes.filter(o => o.estado === "pendiente").length;
  const proceso = ordenes.filter(o => o.estado === "en proceso").length;
  const terminadas = ordenes.filter(o => o.estado === "terminado").length;
  const entregadas = ordenes.filter(o => o.estado === "entregado").length;

  const totalCotizaciones = cotizaciones.length;
  const totalClientes = clientes.length;

  // 💰 INGRESOS
  const ingresos = cotizaciones
    .filter(c => c.estado === "aceptada")
    .reduce((total, c) => total + Number(c.precio || 0), 0);

  // 💵 FORMATO
  const formato = (n) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN"
    }).format(n);

  // 📈 DATA GRÁFICA
  const dataGrafica = cotizaciones
    .filter(c => c.estado === "aceptada" && c.createdAt)
    .map(c => ({
      fecha: new Date(c.createdAt.seconds * 1000).toLocaleDateString(),
      ingreso: Number(c.precio || 0)
    }));

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Resumen general del negocio</p>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">

        <Card title="Ingresos" value={formato(ingresos)} color="bg-emerald-500" />
        <Card title="Clientes" value={totalClientes} color="bg-blue-500" />
        <Card title="Cotizaciones" value={totalCotizaciones} color="bg-yellow-500" />
        <Card title="Pendientes" value={pendientes} color="bg-orange-500" />
        <Card title="En proceso" value={proceso} color="bg-indigo-500" />
        <Card title="Terminadas" value={terminadas} color="bg-green-500" />
        <Card title="Entregadas" value={entregadas} color="bg-gray-500" />

      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ÓRDENES */}
        <div className="bg-white p-4 rounded-xl shadow-sm col-span-2">
          <h2 className="font-bold mb-4">Órdenes recientes</h2>

          {ordenes.slice(0, 6).map(o => (
            <div key={o.id} className="border-b py-2 flex justify-between">
              <div>
                <p className="font-medium">{o.cliente}</p>
                <p className="text-sm text-gray-500">{o.equipo}</p>
              </div>
              <span className="text-xs bg-slate-200 px-2 py-1 rounded">
                {o.estado}
              </span>
            </div>
          ))}
        </div>

        {/* RESUMEN */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <h2 className="font-bold mb-4">Resumen</h2>

          <p className="text-sm mb-2">
            💰 Ingresos: <b>{formato(ingresos)}</b>
          </p>

          <p className="text-sm mb-2">
            📦 Órdenes activas: <b>{pendientes + proceso}</b>
          </p>

          <p className="text-sm mb-2">
            ✅ Finalizadas: <b>{terminadas + entregadas}</b>
          </p>

        </div>

      </div>

      {/* 📊 GRAFICA */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h2 className="font-bold mb-4">Ingresos</h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dataGrafica}>
            <XAxis dataKey="fecha" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="ingreso" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

// 🔹 CARD
function Card({ title, value, color }) {
  return (
    <div className={`p-4 rounded-xl text-white shadow-sm ${color}`}>
      <p className="text-sm opacity-80">{title}</p>
      <h2 className="text-2xl font-bold mt-1">{value}</h2>
    </div>
  );
}

// 🔐 APP
function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  if (!user) return <Login />;

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/clientes" element={<Clientes user={user} />} />
          <Route path="/cotizaciones" element={<Cotizaciones user={user} />} />
          <Route path="/ordenes" element={<Ordenes user={user} />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;