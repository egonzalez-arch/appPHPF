import { useEffect, useState } from "react";
import { fetchPatients } from "../services/patients";
import { useAuth } from "../context/AuthContext";

export default function PatientsList() {
  const [patients, setPatients] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    fetchPatients().then(setPatients).catch(console.error);
  }, [user]);

  return (
    <div>
      {patients.map(p => <div key={p.id}>{p.name}</div>)}
    </div>
  );
}