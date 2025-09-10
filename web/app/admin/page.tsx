'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaLock, FaEnvelope, FaUserShield, FaCheck } from "react-icons/fa";
import { login as apiLogin, User } from "@/lib/api/api";
import { useAuth } from "@/context/AuthContext";
import { Toast } from "@/components/ui/toast";

export default function AdminPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);

  const [adminUser, setAdminUser] = useState<User | null>(null);

  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result: { accessToken: string; user: User } = await apiLogin(email, password);
      if (result.accessToken && result.user) {
        if (result.user.role === "ADMIN") {
          localStorage.setItem("token", result.accessToken);
          login(result.user);
          setAdminUser(result.user);
          setShowToast(true);
        } else {
          setError("No tienes permisos de administrador.");
          setTimeout(() => {
            router.push("/dashboard");
          }, 1200);
        }
      } else {
        setError("Credenciales incorrectas");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Credenciales incorrectas");
      } else {
        setError("Credenciales incorrectas");
      }
    } finally {
      setLoading(false);
    }
  };

  // Si hay un usuario admin logueado, muestra el contenido admin
  if (adminUser && adminUser.role === "ADMIN") {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#fff",
        display: "flex",
        flexDirection: "column"
      }}>
        <div style={{ background: "#1AA6A6", height: "24px", width: "100%" }} />
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
        }}>
          <div style={{
            display: "flex",
            width: "900px",
            height: "480px",
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 1px 8px #dedede",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <FaUserShield size={56} color="#1AA6A6" style={{ marginRight: "24px" }} />
            <div>
              <h2 style={{ margin: "0 0 12px 0", fontWeight: 700 }}>Bienvenido Administrador</h2>
              <p style={{ color: "#444", fontSize: "18px" }}>
                Acceso a la zona de administración. <br /><br />
                Aquí puedes gestionar usuarios, pacientes, doctores y más funciones administrativas.
              </p>
            </div>
          </div>
        </div>
        <Toast open={showToast} message="¡Bienvenido Administrador!" onClose={() => setShowToast(false)} />
      </div>
    );
  }

  // Si no hay usuario admin, muestra el login
  return (
    <div style={{
      minHeight: "100vh",
      background: "#fff",
      display: "flex",
      flexDirection: "column"
    }}>
      <div style={{ background: "#1AA6A6", height: "24px", width: "100%" }} />
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
      }}>
        <div style={{
          display: "flex",
          width: "900px",
          height: "480px",
          background: "#fff",
          borderRadius: "8px",
          boxShadow: "0 1px 8px #dedede",
        }}>
          {/* Logo Area */}
          <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRight: "1px solid #1AA6A6",
            padding: "0 40px"
          }}>
            <span style={{ fontSize: "58px", color: "#444", fontFamily: "sans-serif", display: "flex", alignItems: "center" }}>
              <FaCheck style={{ color: "#1AA6A6", fontSize: "60px", marginRight: "12px" }} />
              PHPF Admin
            </span>
          </div>
          {/* Form Area */}
          <div style={{
            flex: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "0 40px"
          }}>
            <FaLock size={56} color="#1AA6A6" />
            <h2 style={{ margin: "22px 0 0 0", fontWeight: 700 }}>Accede como administrador</h2>
            
            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              <label style={{ fontWeight: 500, color: "#444" }}>Correo Electrónico:</label>
              <div style={{ position: "relative", marginBottom: "10px" }}>
                <FaEnvelope style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#1AA6A6"
                }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 10px 10px 36px",
                    borderRadius: "6px",
                    border: "1px solid #1AA6A6",
                    background: "#f3fcfc",
                    marginTop: "3px"
                  }}
                  placeholder="Correo electrónico"
                  disabled={loading}
                />
              </div>
              <label style={{ fontWeight: 500, color: "#444" }}>Contraseña:</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #1AA6A6",
                  background: "#eef6ff",
                  marginTop: "3px",
                  marginBottom: "12px"
                }}
                placeholder="Contraseña"
                disabled={loading}
              />
              <button
                type="submit"
                style={{
                  width: "100%",
                  background: loading ? "#76d9d9" : "#1AA6A6",
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "18px",
                  padding: "10px 0",
                  border: "none",
                  borderRadius: "6px",
                  marginTop: "8px",
                  marginBottom: "4px",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "background 0.2s"
                }}
                disabled={loading}
              >
                {loading ? "Ingresando..." : "Comenzar"}
              </button>
              {error && <p style={{ color: "red", fontWeight: 500, marginTop: "8px" }}>{error}</p>}
            </form>
          </div>
        </div>
      </div>
      <Toast open={showToast} message={error ? error : "¡Bienvenido!"} onClose={() => setShowToast(false)} />
    </div>
  );
}