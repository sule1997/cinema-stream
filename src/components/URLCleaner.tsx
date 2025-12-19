import { useEffect } from 'react';
import { cleanSocialParameters } from '@/utils/browserDetection';

export function URLCleaner() {
  useEffect(() => {
    cleanSocialParameters();
  }, []);

  return null;
}
