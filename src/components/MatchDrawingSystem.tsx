import { useState } from "react";
import { Player, Match, TournamentFormat } from "../types";
import { Users } from "lucide-react";
import { toast } from "sonner";

interface MatchDrawingSystemProps {
  players: Player[];
  format: TournamentFormat;
  currentRound: number;
  pastMatches: Match[];
  onMatchesGenerated: (matches: Match[]) => void;
}

export function MatchDrawingSystem({ 
  players, 
  format, 
  currentRound,
  pastMatches,
  onMatchesGenerated 
}: MatchDrawingSystemProps) {
  const requiredPlayers = format === 'super8' ? 8 : 12;
  
  const generateMatches = () => {
    if (players.length < requiredPlayers) {
      toast.error(`Você precisa adicionar ${requiredPlayers} jogadores para gerar as partidas!`);
      return;
    }
    
    // Function to check if these players have been partners before
    const haveBeenPartners = (player1: Player, player2: Player): boolean => {
      return pastMatches.some(match => 
        (match.team1[0].id === player1.id && match.team1[1].id === player2.id) ||
        (match.team1[0].id === player2.id && match.team1[1].id === player1.id) ||
        (match.team2[0].id === player1.id && match.team2[1].id === player2.id) ||
        (match.team2[0].id === player2.id && match.team2[1].id === player1.id)
      );
    };

    // Shuffling players
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    
    // For Super 8: we need 4 teams (8 players)
    // For Super 12: we need 6 teams (12 players)
    const numTeams = format === 'super8' ? 4 : 6;
    
    let attempts = 0;
    const maxAttempts = 100; // Limit attempts to prevent infinite loop
    let validPairings = false;
    let teams: [Player, Player][] = [];
    
    while (!validPairings && attempts < maxAttempts) {
      validPairings = true;
      teams = [];
      const tempPlayers = [...shuffledPlayers];
      
      for (let i = 0; i < numTeams; i++) {
        let foundValidPair = false;
        
        // Try to find a valid pair where players haven't been partners before
        for (let j = 0; j < tempPlayers.length; j++) {
          for (let k = j + 1; k < tempPlayers.length; k++) {
            if (!haveBeenPartners(tempPlayers[j], tempPlayers[k])) {
              teams.push([tempPlayers[j], tempPlayers[k]]);
              // Remove these players from the temp array
              tempPlayers.splice(k, 1);
              tempPlayers.splice(j, 1);
              foundValidPair = true;
              break;
            }
          }
          if (foundValidPair) break;
        }
        
        // If we couldn't find a valid pair, we need to try again
        if (!foundValidPair) {
          validPairings = false;
          break;
        }
      }
      
      attempts++;
    }
    
    if (!validPairings) {
      toast.error("Não foi possível gerar duplas sem repetições. Algumas duplas serão repetidas.");
      // In this case, just make random pairs
      teams = [];
      const tempPlayers = [...shuffledPlayers];
      
      for (let i = 0; i < numTeams; i++) {
        teams.push([tempPlayers.pop()!, tempPlayers.pop()!]);
      }
    }
    
    // Create matches
    const newMatches: Match[] = [];
    
    // For Super 8: 2 matches (4 teams)
    // For Super 12: 3 matches (6 teams)
    const numMatches = format === 'super8' ? 2 : 3;
    
    for (let i = 0; i < numMatches; i++) {
      newMatches.push({
        id: crypto.randomUUID(),
        team1: teams[i * 2],
        team2: teams[i * 2 + 1],
        score1: 0,
        score2: 0,
        round: currentRound,
        completed: false
      });
    }
    
    onMatchesGenerated(newMatches);
    toast.success(`${numMatches} partidas geradas com sucesso para a rodada ${currentRound}!`);
  };
  
  return (
    <div className="beach-card mt-6">
      <h2 className="text-xl font-bold mb-4 text-beach-darkGray">Sortear Partidas</h2>
      <p className="text-sm text-gray-600 mb-4">
        Rodada atual: {currentRound}
      </p>
      
      <button
        onClick={generateMatches}
        disabled={players.length < requiredPlayers}
        className={`beach-button-primary w-full flex justify-center items-center gap-2 ${
          players.length < requiredPlayers ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <Users className="h-5 w-5" />
        <span>Sortear Partidas</span>
      </button>
      
      {players.length < requiredPlayers && (
        <p className="text-beach-red text-sm mt-2">
          Você precisa adicionar {requiredPlayers - players.length} jogadores para poder sortear as partidas.
        </p>
      )}
    </div>
  );
}
