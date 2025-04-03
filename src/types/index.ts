export type TournamentFormat = 'super8' | 'super12' | 'tournament';

export interface Player {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  players: [Player, Player];
  name?: string;
}

export interface Match {
  id: string;
  team1: [Player, Player];
  team2: [Player, Player];
  score1: number;
  score2: number;
  round: number;
  completed: boolean;
  groupId?: string; // For group matches
}

export interface PlayerStats {
  player: Player;
  wins: number;
  totalGamesWon: number;
  totalGamesLost: number;
  gameBalance: number;
}

export interface TournamentGroup {
  id: string;
  name: string;
  teams: Team[];
}

export interface TournamentSettings {
  numberOfGroups: number;
  startingRound: 'round16' | 'quarters' | 'semis' | 'final';
  groups: TournamentGroup[];
}