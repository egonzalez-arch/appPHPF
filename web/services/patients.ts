import axios from "../lib/axios"; 

export async function fetchPatients() {
  const res = await axios.get("/patients");
  return res.data;
}