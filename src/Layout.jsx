import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

function Layout({ children }) {
  return (
    <div className="flex h-screen bg-slate-100">

      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col justify-between">

        <div>
          <h1 className="text-2xl font-bold mb-10">Laiten</h1>

          <nav className="space-y-2">

            <Link to="/" className="block p-2 rounded hover:bg-slate-700">
              📊 Dashboard
            </Link>

            <Link to="/clientes" className="block p-2 rounded hover:bg-slate-700">
              👥 Clientes
            </Link>

            <Link to="/cotizaciones" className="block p-2 rounded hover:bg-slate-700">
              🧾 Cotizaciones
            </Link>

            <Link to="/ordenes" className="block p-2 rounded hover:bg-slate-700">
              🔧 Órdenes
            </Link>

          </nav>
        </div>

        <button
          onClick={() => signOut(auth)}
          className="bg-red-500 p-2 rounded"
        >
          Cerrar sesión
        </button>

      </aside>

      {/* CONTENIDO */}
      <div className="flex-1 p-6 overflow-y-auto">
        {children}
      </div>

    </div>
  );
}

export default Layout;