export interface Player {
  id: string;
  name: string;
}

export interface Match {
  id: string;
  team1: [Player, Player];
  team2: [Player, Player];
  score1: number;
  score2: number;
  completed: boolean;
  round: number;
}

export interface Round {
  number: number;
  matches: Match[];
}

export interface PlayerStats {
  player: Player;
  wins: number;
  totalGamesWon: number;
  totalGamesLost: number;
  gameBalance: number;
  matchesPlayed: number;
}

// Update TournamentFormat to only allow 'super8' | 'super12'
export type TournamentFormat = 'super8' | 'super12';

export interface SortingCriterion {
  field: keyof PlayerStats;
  direction: 'asc' | 'desc';
}

export interface Event {
  id: string;
  name: string;
  code?: string;
  format: TournamentFormat;
  players: Player[];
  matches: Match[];
  completedMatches: Match[];
  createdAt: Date;
}
