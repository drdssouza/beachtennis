import { useState, useEffect } from "react";
import { Player, Match, TournamentFormat } from "../types";
import { toast } from "sonner";

export function useMatchGeneration(
  players: Player[],
  format: TournamentFormat,
  currentRound: number,
  pastMatches: Match[],
) {
  const [usedPairs, setUsedPairs] = useState<Set<string>>(new Set());
  const [tournamentComplete, setTournamentComplete] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 10;
  const requiredPlayers = format === "super8" ? 8 : format === "super12" ? 12 : 4;

  // Atualiza usedPairs quando pastMatches mudar
  useEffect(() => {
    const initialPairs = new Set<string>();
    pastMatches.forEach((match) => {
      const pair1 = [match.team1[0].id, match.team1[1].id].sort().join("-");
      const pair2 = [match.team2[0].id, match.team2[1].id].sort().join("-");
      initialPairs.add(pair1);
      initialPairs.add(pair2);
    });
    setUsedPairs(initialPairs);
    
    // Verifica se o torneio foi concluído
    if (format === "super8" || format === "super12") {
      checkTournamentCompletion(initialPairs);
    }
  }, [pastMatches, format, players]);

  // Verifica se todas as possíveis combinações de duplas já foram usadas
  const checkTournamentCompletion = (pairs: Set<string>) => {
    if (players.length < requiredPlayers) return;
    
    // Calcula o número total de possíveis pares
    const totalPossiblePairs = (players.length * (players.length - 1)) / 2;
    
    // Se todos os pares possíveis já foram usados, o torneio está completo
    if (pairs.size >= totalPossiblePairs) {
      setTournamentComplete(true);
      
      // Mostra toast apenas na primeira vez que detectamos que o torneio terminou
      if (!tournamentComplete) {
        toast.success("Parabéns! Todas as combinações de duplas possíveis foram realizadas. O torneio está completo!", {
          duration: 6000,
        });
      }
    } else {
      setTournamentComplete(false);
    }
  };

  // Função que tenta gerar um conjunto de partidas
  const tryGenerateMatches = () => {
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    const numTeams = format === "super8" ? 4 : 6;
    const newMatches: Match[] = [];
    const currentRoundUsedPlayers = new Set<string>();
    const tempUsedPairs = new Set(usedPairs);
    let possible = true;

    for (let i = 0; i < numTeams / 2; i++) {
      let team1: [Player, Player] | null = null;
      let team2: [Player, Player] | null = null;

      // Tenta encontrar uma dupla válida para o time 1
      for (let j = 0; j < shuffledPlayers.length; j++) {
        for (let k = j + 1; k < shuffledPlayers.length; k++) {
          const player1 = shuffledPlayers[j];
          const player2 = shuffledPlayers[k];
          const pair1 = [player1.id, player2.id].sort().join("-");

          if (
            !tempUsedPairs.has(pair1) &&
            !currentRoundUsedPlayers.has(player1.id) &&
            !currentRoundUsedPlayers.has(player2.id)
          ) {
            team1 = [player1, player2];
            currentRoundUsedPlayers.add(player1.id);
            currentRoundUsedPlayers.add(player2.id);
            
            // Trabalhar com cópia do array para evitar problemas
            const tempPlayers = [...shuffledPlayers];
            tempPlayers.splice(tempPlayers.findIndex(p => p.id === player2.id), 1);
            tempPlayers.splice(tempPlayers.findIndex(p => p.id === player1.id), 1);
            shuffledPlayers.length = 0;
            shuffledPlayers.push(...tempPlayers);
            
            tempUsedPairs.add(pair1);
            break;
          }
        }
        if (team1) break;
      }

      // Tenta encontrar uma dupla válida para o time 2
      if (team1) {
        for (let j = 0; j < shuffledPlayers.length; j++) {
          for (let k = j + 1; k < shuffledPlayers.length; k++) {
            const player3 = shuffledPlayers[j];
            const player4 = shuffledPlayers[k];
            const pair2 = [player3.id, player4.id].sort().join("-");
            if (
              !tempUsedPairs.has(pair2) &&
              !currentRoundUsedPlayers.has(player3.id) &&
              !currentRoundUsedPlayers.has(player4.id)
            ) {
              team2 = [player3, player4];
              currentRoundUsedPlayers.add(player3.id);
              currentRoundUsedPlayers.add(player4.id);
              
              const tempPlayers = [...shuffledPlayers];
              tempPlayers.splice(tempPlayers.findIndex(p => p.id === player4.id), 1);
              tempPlayers.splice(tempPlayers.findIndex(p => p.id === player3.id), 1);
              shuffledPlayers.length = 0;
              shuffledPlayers.push(...tempPlayers);
              
              tempUsedPairs.add(pair2);
              break;
            }
          }
          if (team2) break;
        }
      }

      if (team1 && team2) {
        newMatches.push({
          id: crypto.randomUUID(),
          team1,
          team2,
          score1: 0,
          score2: 0,
          round: currentRound,
          completed: false,
        });
      } else {
        possible = false;
        break;
      }
    }

    if (possible) {
      setUsedPairs(tempUsedPairs);
      return { success: true, matches: newMatches };
    } else {
      return { success: false, matches: [] };
    }
  };

  // Função para gerar partidas com tentativas automáticas
  const generateMatches = (onMatchesGenerated: (matches: Match[]) => void) => {
    if (players.length < requiredPlayers) {
      toast.error(
        `Você precisa adicionar ${requiredPlayers} jogadores para gerar as partidas!`
      );
      return;
    }

    if (format === "tournament") {
      toast.info("Formato de torneio detectado. Por favor, configure os grupos primeiro.");
      return;
    }

    let allPossibleCombinationsTried = false;
    let attempt = 0;
    let resultMatches: Match[] = [];

    // Loop para tentar diferentes combinações automaticamente
    while (!allPossibleCombinationsTried && attempt < maxRetries) {
      const result = tryGenerateMatches();
      if (result.success) {
        resultMatches = result.matches;
        allPossibleCombinationsTried = true;
      } else {
        attempt++;
      }
    }

    if (resultMatches.length > 0) {
      // Atualiza o estado e notifica o sucesso
      onMatchesGenerated(resultMatches);
      toast.success(
        `${resultMatches.length} partidas geradas com sucesso para a rodada ${currentRound}!`
      );
    } else {
      // Notifica sobre a falha após várias tentativas
      toast.error(
        "Não foi possível gerar partidas após várias tentativas. Algumas duplas podem já ter jogado juntas ou não há combinações válidas restantes."
      );
      onMatchesGenerated([]);
    }
  };

  return {
    generateMatches,
    tournamentComplete,
    requiredPlayers
  };
}