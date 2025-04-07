import { useState } from "react";
import { Player, Match, Round } from "../types";
import { toast } from "sonner";

export function useMatchGeneration(players: Player[], pastMatches: Match[]) {
  const [allRounds, setAllRounds] = useState<Round[]>([]);
  const [tournamentComplete, setTournamentComplete] = useState(false);
  
  // Determine required players based on format
  const getRequiredPlayers = () => {
    // We only support super8 (8 players) or super12 (12 players)
    if (players.length === 12) return 12;
    return 8; // Default to super8
  };

  const requiredPlayers = getRequiredPlayers();

  // Function to generate all rounds at once
  const generateAllRounds = () => {
    if (players.length !== 8 && players.length !== 12) {
      toast.error("Este sistema suporta apenas 8 ou 12 jogadores (Super 8 ou Super 12).");
      return [];
    }

    const totalRounds = players.length - 1;
    const matchesPerRound = players.length / 4;
    
    // Track used pairs for the entire tournament
    const usedPairs = new Set<string>();
    
    // Track partnerships (how many times players have played together)
    const partnerships = new Map<string, Map<string, number>>();
    
    // Track oppositions (how many times players have played against each other)
    const oppositions = new Map<string, Map<string, number>>();
    
    // Initialize tracking structures
    for (const player of players) {
      partnerships.set(player.id, new Map());
      oppositions.set(player.id, new Map());
      
      for (const otherPlayer of players) {
        if (player.id !== otherPlayer.id) {
          partnerships.get(player.id)?.set(otherPlayer.id, 0);
          oppositions.get(player.id)?.set(otherPlayer.id, 0);
        }
      }
    }
    
    // Account for any past matches
    pastMatches.forEach(match => {
      // Register partnerships
      incrementPartnership(match.team1[0].id, match.team1[1].id, partnerships);
      incrementPartnership(match.team2[0].id, match.team2[1].id, partnerships);
      
      // Register oppositions
      incrementOpposition(match.team1[0].id, match.team2[0].id, oppositions);
      incrementOpposition(match.team1[0].id, match.team2[1].id, oppositions);
      incrementOpposition(match.team1[1].id, match.team2[0].id, oppositions);
      incrementOpposition(match.team1[1].id, match.team2[1].id, oppositions);
      
      // Register used pairs
      const pair1 = [match.team1[0].id, match.team1[1].id].sort().join("-");
      const pair2 = [match.team2[0].id, match.team2[1].id].sort().join("-");
      usedPairs.add(pair1);
      usedPairs.add(pair2);
    });

    // Generate all possible pairs
    const possiblePairs: [Player, Player][] = [];
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const pairKey = [players[i].id, players[j].id].sort().join("-");
        if (!usedPairs.has(pairKey)) {
          possiblePairs.push([players[i], players[j]]);
        }
      }
    }

    // Generate rounds
    const rounds: Round[] = [];
    for (let roundNum = 1; roundNum <= totalRounds; roundNum++) {
      const round: Round = { number: roundNum, matches: [] };
      const usedPlayersThisRound = new Set<string>();
      
      // Try to find the best match combinations for this round
      for (let matchNum = 0; matchNum < matchesPerRound; matchNum++) {
        let bestMatch: Match | null = null;
        let bestScore = -Infinity;
        
        // Try all possible pair combinations
        for (let i = 0; i < possiblePairs.length; i++) {
          // Skip if this pair is already used or players already used in this round
          const pair1 = [possiblePairs[i][0].id, possiblePairs[i][1].id].sort().join("-");
          if (usedPairs.has(pair1)) continue;
          if (usedPlayersThisRound.has(possiblePairs[i][0].id) || usedPlayersThisRound.has(possiblePairs[i][1].id)) continue;
          
          for (let j = i + 1; j < possiblePairs.length; j++) {
            // Skip if this pair is already used or players already used in this round
            const pair2 = [possiblePairs[j][0].id, possiblePairs[j][1].id].sort().join("-");
            if (usedPairs.has(pair2)) continue;
            if (usedPlayersThisRound.has(possiblePairs[j][0].id) || usedPlayersThisRound.has(possiblePairs[j][1].id)) continue;
            
            // Check if all 4 players are different
            const playerSet = new Set([
              possiblePairs[i][0].id, 
              possiblePairs[i][1].id, 
              possiblePairs[j][0].id, 
              possiblePairs[j][1].id
            ]);
            
            if (playerSet.size !== 4) continue;
            
            // Calculate score for this match combination
            // We want:
            // 1. To maximize variety of oppositions
            const oppositionScore = getOppositionScore(
              possiblePairs[i][0].id, 
              possiblePairs[i][1].id, 
              possiblePairs[j][0].id, 
              possiblePairs[j][1].id, 
              oppositions
            );
            
            const score = oppositionScore;
            
            if (score > bestScore) {
              bestScore = score;
              bestMatch = {
                id: crypto.randomUUID(),
                team1: [possiblePairs[i][0], possiblePairs[i][1]] as [Player, Player],
                team2: [possiblePairs[j][0], possiblePairs[j][1]] as [Player, Player],
                score1: 0,
                score2: 0,
                round: roundNum,
                completed: false
              };
            }
          }
        }
        
        // Add the best match to this round
        if (bestMatch) {
          round.matches.push(bestMatch);
          
          // Mark these players as used in this round
          usedPlayersThisRound.add(bestMatch.team1[0].id);
          usedPlayersThisRound.add(bestMatch.team1[1].id);
          usedPlayersThisRound.add(bestMatch.team2[0].id);
          usedPlayersThisRound.add(bestMatch.team2[1].id);
          
          // Mark these pairs as used overall
          const pair1 = [bestMatch.team1[0].id, bestMatch.team1[1].id].sort().join("-");
          const pair2 = [bestMatch.team2[0].id, bestMatch.team2[1].id].sort().join("-");
          usedPairs.add(pair1);
          usedPairs.add(pair2);
          
          // Update partnerships and oppositions
          incrementPartnership(bestMatch.team1[0].id, bestMatch.team1[1].id, partnerships);
          incrementPartnership(bestMatch.team2[0].id, bestMatch.team2[1].id, partnerships);
          
          incrementOpposition(bestMatch.team1[0].id, bestMatch.team2[0].id, oppositions);
          incrementOpposition(bestMatch.team1[0].id, bestMatch.team2[1].id, oppositions);
          incrementOpposition(bestMatch.team1[1].id, bestMatch.team2[0].id, oppositions);
          incrementOpposition(bestMatch.team1[1].id, bestMatch.team2[1].id, oppositions);
        }
      }
      
      // Check if we created all expected matches for this round
      if (round.matches.length < matchesPerRound) {
        // In a real-world solution, we might do backtracking here to try different combinations
        console.error(`Não foi possível gerar todas as partidas para a rodada ${roundNum}`);
      }
      
      rounds.push(round);
    }
    
    // Verify if the tournament is complete (all players have paired with all others)
    checkTournamentCompletion(usedPairs);
    
    return rounds;
  };
  
  // Helper function to check if tournament is complete
  const checkTournamentCompletion = (pairs: Set<string>) => {
    if (players.length < requiredPlayers) return;
    
    // Calculate total possible pairs
    const totalPossiblePairs = (players.length * (players.length - 1)) / 2;
    
    if (pairs.size >= totalPossiblePairs) {
      setTournamentComplete(true);
    } else {
      setTournamentComplete(false);
    }
  };

  // Helper function to increment partnership counter
  const incrementPartnership = (player1: string, player2: string, partnerships: Map<string, Map<string, number>>) => {
    if (partnerships.has(player1) && partnerships.get(player1)?.has(player2)) {
      const currentCount = partnerships.get(player1)?.get(player2) || 0;
      partnerships.get(player1)?.set(player2, currentCount + 1);
    }
    
    if (partnerships.has(player2) && partnerships.get(player2)?.has(player1)) {
      const currentCount = partnerships.get(player2)?.get(player1) || 0;
      partnerships.get(player2)?.set(player1, currentCount + 1);
    }
  };

  // Helper function to increment opposition counter
  const incrementOpposition = (player1: string, player2: string, oppositions: Map<string, Map<string, number>>) => {
    if (oppositions.has(player1) && oppositions.get(player1)?.has(player2)) {
      const currentCount = oppositions.get(player1)?.get(player2) || 0;
      oppositions.get(player1)?.set(player2, currentCount + 1);
    }
    
    if (oppositions.has(player2) && oppositions.get(player2)?.has(player1)) {
      const currentCount = oppositions.get(player2)?.get(player1) || 0;
      oppositions.get(player2)?.set(player1, currentCount + 1);
    }
  };

  // Calculate opposition score - negative value so less opposition is better
  const getOppositionScore = (p1: string, p2: string, p3: string, p4: string, oppositions: Map<string, Map<string, number>>) => {
    // Calculate how many times these players have played against each other
    let score = 0;
    score -= oppositions.get(p1)?.get(p3) || 0;
    score -= oppositions.get(p1)?.get(p4) || 0;
    score -= oppositions.get(p2)?.get(p3) || 0;
    score -= oppositions.get(p2)?.get(p4) || 0;
    return score;
  };

  // Main function to generate all matches for the tournament
  const generateAllMatches = (onMatchesGenerated: (rounds: Round[]) => void) => {
    if (players.length !== 8 && players.length !== 12) {
      toast.error(`Este sistema suporta apenas 8 ou 12 jogadores (Super 8 ou Super 12).`);
      return;
    }

    try {
      const generatedRounds = generateAllRounds();
      
      if (generatedRounds.length > 0) {
        setAllRounds(generatedRounds);
        onMatchesGenerated(generatedRounds);
        
        const totalMatches = generatedRounds.reduce((sum, round) => sum + round.matches.length, 0);
        toast.success(`${totalMatches} partidas distribuídas em ${generatedRounds.length} rodadas geradas com sucesso!`);
      } else {
        toast.error("Não foi possível gerar todas as rodadas. Por favor, tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao gerar partidas:", error);
      toast.error("Ocorreu um erro ao gerar as partidas. Por favor, verifique o console para mais detalhes.");
    }
  };

  return {
    generateAllMatches,
    allRounds,
    tournamentComplete,
    requiredPlayers
  };
}