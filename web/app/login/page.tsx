'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaLock, FaEnvelope, FaCheck } from "react-icons/fa";
import { login as apiLogin } from "@/lib/api";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const result = await apiLogin(email, password);
      if (result.accessToken) {
        localStorage.setItem("token", result.accessToken);
        login({ email }); // Guarda el usuario en el contexto
        router.push("/dashboard");
      } else {
        setError("Credenciales incorrectas");
      }
    } catch (err: any) {
      setError(err.message || "Credenciales incorrectas");
      console.log("Login error:", err);
    }
  };

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
              PHPF
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
            <h2 style={{ margin: "22px 0 0 0", fontWeight: 700 }}>Accede a tu cuenta</h2>
            
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
              />
              <button
                type="submit"
                style={{
                  width: "100%",
                  background: "#1AA6A6",
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "18px",
                  padding: "10px 0",
                  border: "none",
                  borderRadius: "6px",
                  marginTop: "8px",
                  marginBottom: "4px",
                  cursor: "pointer",
                  transition: "background 0.2s"
                }}
              >
                Comenzar
              </button>
              {error && <p style={{ color: "red", fontWeight: 500, marginTop: "8px" }}>{error}</p>}
            </form>
            <div style={{ marginTop: "18px", fontSize: "15px", textAlign: "center" }}>
              <span>¿Aún no tienes una cuenta? <a style={{ color: "#1AA6A6", textDecoration: "underline", cursor: "pointer" }} href="#">Regístrate</a></span>
              <br />
              <span>¿Olvidaste tu contraseña? <a style={{ color: "#1AA6A6", textDecoration: "underline", cursor: "pointer" }} href="#">Recupérala aquí</a></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}