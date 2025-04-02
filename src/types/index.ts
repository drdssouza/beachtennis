export type TournamentFormat = 'super8' | 'super12';

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
  round: number;
  completed: boolean;
}

export interface PlayerStats {
  player: Player;
  wins: number;
  totalGamesWon: number;
  totalGamesLost: number;
  gameBalance: number;
}
