import { useState, useEffect } from 'react';
import { SimpleDoData } from '../types';
import { storage } from '../services/storage';

export function useSimpleDoData(): SimpleDoData {
  const [data, setData] = useState<SimpleDoData>(() => storage.load());

  useEffect(() => {
    const handleUpdate = () => {
      setData(storage.load());
    };

    window.addEventListener('simpledo:change', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('simpledo:change', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return data;
}
