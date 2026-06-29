import { useState } from "react";
import api from "@/lib/api";

export function useInsurance() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function submitQuery(query: string, state: string) {
    setLoading(true);
    try {
      const res = await api.post("/api/insurance/navigate", { query, state });
      setResult(res.data);
      return res.data;
    } finally {
      setLoading(false);
    }
  }

  return { loading, result, submitQuery };
}