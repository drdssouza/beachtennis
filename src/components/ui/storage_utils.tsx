const STORAGE_KEY = "beachTennisMatches";

export const saveUsedPairs = (pairs: Set<string>) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(pairs)));
  }
};

export const loadUsedPairs = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  const savedPairs = localStorage.getItem(STORAGE_KEY);
  return savedPairs ? new Set(JSON.parse(savedPairs)) : new Set();
};