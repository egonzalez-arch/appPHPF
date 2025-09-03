import { useEffect, useState } from "react";
import axios from "../lib/axios";

export function useUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.post("/auth/validate-session")
      .then(res => setUser(res.data?.user || null))
      .catch(() => setUser(null));
  }, []);

  return user;
}