import { useEffect, useState } from "react";

export function useUser() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/validate-session`, {
      method: "POST",
      credentials: "include",
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => setUser(data?.user || null))
      .catch(() => setUser(null));
  }, []);
  return user;
}