// Chaves para armazenamento local
const TOURNAMENT_DATA_KEY = "beachTennis_tournamentData";

// Interface para o modelo de dados que será salvo
interface TournamentStorage {
  usedPairs: string[];
  format: string | null;
  sortingCriteria: SortingCriterion[];
  tournamentSettings: {
    numberOfGroups: number;
    startingRound: string;
    groups: any[];
  } | null;
  lastUpdated: number;
}

export type SortingCriterion = 'wins' | 'gameBalance' | 'totalGamesWon' | 'totalGamesLost';

// Valores padrão
const DEFAULT_STORAGE: TournamentStorage = {
  usedPairs: [],
  format: null,
  sortingCriteria: ['wins', 'gameBalance', 'totalGamesWon', 'totalGamesLost'],
  tournamentSettings: null,
  lastUpdated: Date.now()
};

// Carrega os dados armazenados com fallback para valores padrão
export const loadTournamentData = (): TournamentStorage => {
  try {
    const savedData = localStorage.getItem(TOURNAMENT_DATA_KEY);
    if (!savedData) return { ...DEFAULT_STORAGE };
    return JSON.parse(savedData);
  } catch (error) {
    console.error("Erro ao carregar dados do torneio:", error);
    return { ...DEFAULT_STORAGE };
  }
};

// Salva os dados com mecanismo de backup automático
export const saveTournamentData = (data: Partial<TournamentStorage>): void => {
  try {
    // Carrega os dados existentes
    const existingData = loadTournamentData();
    
    // Mescla com os novos dados
    const updatedData: TournamentStorage = {
      ...existingData,
      ...data,
      lastUpdated: Date.now()
    };
    
    // Salva no localStorage
    localStorage.setItem(TOURNAMENT_DATA_KEY, JSON.stringify(updatedData));
  } catch (error) {
    console.error("Erro ao salvar dados do torneio:", error);
  }
};

// Funções específicas para cada tipo de dado
export const saveUsedPairs = (pairs: Set<string>): void => {
  saveTournamentData({ usedPairs: Array.from(pairs) });
};

export const loadUsedPairs = (): Set<string> => {
  const data = loadTournamentData();
  return new Set(data.usedPairs || []);
};

export const saveSortingCriteria = (criteria: SortingCriterion[]): void => {
  saveTournamentData({ sortingCriteria: criteria });
};

export const loadSortingCriteria = (): SortingCriterion[] => {
  const data = loadTournamentData();
  return data.sortingCriteria || DEFAULT_STORAGE.sortingCriteria;
};

export const saveFormat = (format: string | null): void => {
  saveTournamentData({ format });
};

export const saveTournamentSettings = (settings: any): void => {
  saveTournamentData({ tournamentSettings: settings });
};

export const loadTournamentSettings = (): any => {
  const data = loadTournamentData();
  return data.tournamentSettings;
};

export const resetTournamentData = (): void => {
  localStorage.removeItem(TOURNAMENT_DATA_KEY);
};
