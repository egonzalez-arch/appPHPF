const API_URL = "http://localhost:3001";

export async function login(email: string, password: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    // Puedes lanzar el status, el mensaje, etc.
    const errorMessage = await res.text();
    throw new Error(errorMessage || "Credenciales incorrectas");
  }

  return await res.json(); // Espera { accessToken: ... }
}

export async function fetchUsers(token: string) {
  const res = await fetch(`${API_URL}/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("No autorizado");
  return res.json();
}