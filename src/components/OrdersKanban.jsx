import { useNavigate } from "react-router-dom";

const ESTADOS = ["pendiente", "en proceso", "terminado", "entregado"];

const colores = {
  pendiente: "bg-yellow-100 border-yellow-400",
  "en proceso": "bg-blue-100 border-blue-400",
  terminado: "bg-green-100 border-green-400",
  entregado: "bg-gray-200 border-gray-400"
};

export default function OrdersKanban({ ordenes = [], onChangeStatus }) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">

      {ESTADOS.map((estado) => {
        const lista = ordenes.filter(o => o.estado === estado);

        return (
          <div key={estado} className="bg-gray-50 p-3 rounded-xl shadow-sm">

            {/* HEADER COLUMNA */}
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold capitalize">{estado}</h3>
              <span className="text-sm bg-gray-200 px-2 rounded">
                {lista.length}
              </span>
            </div>

            {/* TARJETAS */}
            <div className="space-y-3">

              {lista.map((orden) => (
                <div
                  key={orden.id}
                  onClick={() => navigate(`/orden/${orden.id}`)}
                  className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition ${colores[estado]}`}
                >

                  {/* FOLIO */}
                  <p className="text-xs text-gray-500">
                    {orden.folio || "Sin folio"}
                  </p>

                  {/* CLIENTE */}
                  <p className="font-semibold">
                    {orden.cliente}
                  </p>

                  {/* EQUIPO */}
                  <p className="text-sm text-gray-700">
                    {orden.equipo}
                  </p>

                  {/* PROBLEMA */}
                  <p className="text-xs text-gray-600 truncate">
                    {orden.problema}
                  </p>

                  {/* COSTO */}
                  <div className="flex justify-between mt-2 text-xs">
                    <span>💰 ${orden.precio || 0}</span>
                  </div>

                  {/* CAMBIO DE ESTADO */}
                  <select
                    value={orden.estado}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      onChangeStatus(orden.id, e.target.value)
                    }
                    className="mt-2 w-full text-xs rounded p-1 border"
                  >
                    {ESTADOS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                </div>
              ))}

              {/* VACÍO */}
              {lista.length === 0 && (
                <p className="text-xs text-gray-400">
                  Sin órdenes
                </p>
              )}

            </div>
          </div>
        );
      })}

    </div>
  );
}