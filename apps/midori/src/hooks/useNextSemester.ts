"use client";
import { useState, useEffect, useCallback } from "react";
import { momoi_client } from "@midori/libs/momoi";

interface NextSemester {
  id: number;
  name: string;
  start_at: string;
  end_at: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export function useNextSemester() {
  const [nextSemester, setNextSemester] = useState<NextSemester | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNextSemester = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await momoi_client.api.v1.public["next-semester"].get();
      
      if (result.error) {
        if (result.error.value?.message === "No next semester found") {
          setNextSemester(null);
          setError(null); // Don't treat "no next semester" as an error
        } else {
          throw new Error(result.error.value?.message || 'Failed to fetch next semester');
        }
      } else {
        setNextSemester(result.data?.data || null);
        setError(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch next semester';
      setError(errorMessage);
      console.error('Error fetching next semester:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNextSemester();
  }, [fetchNextSemester]);

  return {
    nextSemester,
    loading,
    error,
    refetch: fetchNextSemester,
  };
}
