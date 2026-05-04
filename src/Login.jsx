import { useState } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err) {
      alert("Error al iniciar sesión");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-100">

      <div className="bg-white p-6 rounded-xl shadow w-80">
        <h2 className="text-xl font-bold mb-4">Laiten Login</h2>

        <input
          className="border p-2 w-full mb-2 rounded"
          placeholder="Correo"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="border p-2 w-full mb-4 rounded"
          placeholder="Contraseña"
          onChange={(e) => setPass(e.target.value)}
        />

        <button
          onClick={login}
          className="bg-indigo-600 text-white w-full p-2 rounded"
        >
          Entrar
        </button>
      </div>

    </div>
  );
}

export default Login;