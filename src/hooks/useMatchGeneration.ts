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

  // Função para gerar todas as combinações possíveis de duplas
  const generateAllPairs = () => {
    const allPairs: [Player, Player][] = [];
    
    // Gera todas as combinações possíveis de duplas (sem repetição)
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        allPairs.push([players[i], players[j]]);
      }
    }
    
    return allPairs;
  };

  // Função para verificar se uma partida é válida (jogadores não se repetem entre times)
  const isValidMatch = (team1: [Player, Player], team2: [Player, Player]) => {
    const ids = new Set([team1[0].id, team1[1].id, team2[0].id, team2[1].id]);
    return ids.size === 4; // Todos os 4 jogadores devem ser diferentes
  };

  // Função para gerar todas as partidas possíveis
  const generateAllPossibleMatches = () => {
    // Cria todas as combinações possíveis de duplas
    const allPairs = generateAllPairs();
    
    // Combinações já usadas
    const usedPairIds = new Set<string>();
    pastMatches.forEach(match => {
      const pair1 = [match.team1[0].id, match.team1[1].id].sort().join('-');
      const pair2 = [match.team2[0].id, match.team2[1].id].sort().join('-');
      usedPairIds.add(pair1);
      usedPairIds.add(pair2);
    });
    
    // Filtra apenas as duplas que ainda não foram usadas
    const availablePairs = allPairs.filter(pair => {
      const pairId = [pair[0].id, pair[1].id].sort().join('-');
      return !usedPairIds.has(pairId);
    });
    
    if (availablePairs.length < 2) {
      return { success: false, matches: [] };
    }
    
    // Gera todas as combinações possíveis de partidas
    const possibleMatches: Match[] = [];
    const usedMatchPairs = new Set<string>();
    const newUsedPairs = new Set(usedPairs);
    
    // Para cada par de duplas disponíveis, verifica se podem formar uma partida válida
    for (let i = 0; i < availablePairs.length; i++) {
      for (let j = i + 1; j < availablePairs.length; j++) {
        const team1 = availablePairs[i];
        const team2 = availablePairs[j];
        
        // Verifica se é uma partida válida (sem jogadores repetidos)
        if (!isValidMatch(team1, team2)) continue;
        
        // Cria IDs para as duplas
        const pair1Id = [team1[0].id, team1[1].id].sort().join('-');
        const pair2Id = [team2[0].id, team2[1].id].sort().join('-');
        
        // Verifica se alguma dessas duplas já foi usada em outra partida
        if (newUsedPairs.has(pair1Id) || newUsedPairs.has(pair2Id)) continue;
        
        // Cria um ID único para a combinação de duplas para evitar duplicatas
        const matchPairId = [pair1Id, pair2Id].sort().join('|');
        
        // Verifica se essa combinação já foi usada
        if (usedMatchPairs.has(matchPairId)) continue;
        
        // Marca as duplas como usadas
        newUsedPairs.add(pair1Id);
        newUsedPairs.add(pair2Id);
        usedMatchPairs.add(matchPairId);
        
        // Adiciona a partida
        possibleMatches.push({
          id: crypto.randomUUID(),
          team1: team1 as [Player, Player],
          team2: team2 as [Player, Player],
          score1: 0,
          score2: 0,
          round: currentRound,
          completed: false
        });
      }
    }
    
    // Atualiza o estado
    setUsedPairs(newUsedPairs);
    
    return { success: true, matches: possibleMatches };
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
        `${result.matches.length} partidas geradas com sucesso para o torneio!`
      );
      
      // Se estiver próximo do fim, avise o usuário
      const totalPossiblePairs = (players.length * (players.length - 1)) / 2;
      const unusedPairsLeft = totalPossiblePairs - usedPairs.size - (result.matches.length * 2);
      
      if (unusedPairsLeft < 4 && unusedPairsLeft > 0) {
        toast.info(`Restam apenas ${unusedPairsLeft} combinações possíveis de duplas.`, {
          duration: 5000,
        });
      }
    } else if (result.matches.length === 0) {
      // Verifica se há jogadores suficientes
      const totalPossiblePairs = (players.length * (players.length - 1)) / 2;
      
      if (usedPairs.size >= totalPossiblePairs) {
        setTournamentComplete(true);
        toast.info("Todas as combinações possíveis já foram realizadas! O torneio está completo.", {
          duration: 6000,
        });
      } else {
        toast.error(
          "Não foi possível gerar mais partidas. Verifique se há combinações válidas disponíveis."
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