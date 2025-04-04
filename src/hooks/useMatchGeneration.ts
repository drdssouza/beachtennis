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

  // Função melhorada para gerar todas as partidas possíveis de uma vez
  const generateAllPossibleMatches = () => {
    // Cria todas as combinações possíveis de duplas
    const allPairs: [Player, Player][] = [];
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        allPairs.push([players[i], players[j]]);
      }
    }
    
    // Filtra apenas os pares que ainda não foram usados
    const unusedPairs = allPairs.filter(pair => {
      const pairId = [pair[0].id, pair[1].id].sort().join("-");
      return !usedPairs.has(pairId);
    });
    
    if (unusedPairs.length < 2) {
      // Não há pares suficientes para formar uma partida
      return { success: false, matches: [] };
    }
    
    // Embaralha os pares não utilizados
    const shuffledPairs = [...unusedPairs].sort(() => Math.random() - 0.5);
    
    // Calcula quantas partidas podemos formar (máximo possível)
    const numMatches = Math.floor(shuffledPairs.length / 2);
    const newMatches: Match[] = [];
    const newUsedPairs = new Set(usedPairs);
    
    for (let i = 0; i < numMatches; i++) {
      const team1 = shuffledPairs[i * 2];
      const team2 = shuffledPairs[i * 2 + 1];
      
      const pair1Id = [team1[0].id, team1[1].id].sort().join("-");
      const pair2Id = [team2[0].id, team2[1].id].sort().join("-");
      
      newUsedPairs.add(pair1Id);
      newUsedPairs.add(pair2Id);
      
      newMatches.push({
        id: crypto.randomUUID(),
        team1: team1 as [Player, Player],
        team2: team2 as [Player, Player],
        score1: 0,
        score2: 0,
        round: currentRound,
        completed: false,
      });
    }
    
    setUsedPairs(newUsedPairs);
    return { success: true, matches: newMatches };
  };

  // Função para gerar partidas
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

    const result = generateAllPossibleMatches();
    
    if (result.success && result.matches.length > 0) {
      // Atualiza o estado e notifica o sucesso
      onMatchesGenerated(result.matches);
      toast.success(
        `${result.matches.length} partidas geradas com sucesso para a rodada ${currentRound}!`
      );
      
      // Se estiver próximo do fim, avise o usuário
      const unusedPairsLeft = (players.length * (players.length - 1)) / 2 - usedPairs.size - result.matches.length;
      if (unusedPairsLeft < 4 && unusedPairsLeft > 0) {
        toast.info(`Restam apenas ${unusedPairsLeft} combinações possíveis de duplas.`, {
          duration: 5000,
        });
      }
    } else if (result.matches.length === 0) {
      // Verifica se há jogadores suficientes
      if (usedPairs.size >= ((players.length * (players.length - 1)) / 2) - 1) {
        setTournamentComplete(true);
        toast.info("Todas as combinações possíveis já foram realizadas! O torneio está completo.", {
          duration: 6000,
        });
      } else {
        toast.error(
          "Não foi possível gerar mais partidas. Por favor, adicione mais jogadores ou inicie um novo torneio."
        );
      }
      onMatchesGenerated([]);
    }
  };

  return {
    generateMatches,
    tournamentComplete,
    requiredPlayers
  };
}
