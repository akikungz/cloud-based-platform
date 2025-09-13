import { useState, useEffect, useCallback } from 'react';
import { momoi_client } from '@midori/libs/momoi';

interface ActiveSemester {
  id: number;
  name: string;
  start_at: Date;
  end_at: Date;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export function useActiveSemester() {
  const [activeSemester, setActiveSemester] = useState<ActiveSemester | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveSemester = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await momoi_client.api.v1.public["active-semester"].get();
      
      if (result.error) {
        if (result.error.value?.message === "No active semester found") {
          setActiveSemester(null);
          setError(null); // Don't treat "no active semester" as an error
        } else {
          throw new Error(result.error.value?.message || 'Failed to fetch active semester');
        }
      } else {
        setActiveSemester(result.data?.data || null);
        setError(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch active semester';
      setError(errorMessage);
      console.error('Error fetching active semester:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveSemester();
  }, [fetchActiveSemester]);

  return {
    activeSemester,
    loading,
    error,
    refetch: fetchActiveSemester,
  };
}
