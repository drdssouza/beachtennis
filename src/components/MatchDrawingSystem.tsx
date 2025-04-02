import React, { useState, useEffect } from "react";
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
  onMatchesGenerated,
}: MatchDrawingSystemProps) {
  const requiredPlayers = format === "super8" ? 8 : 12;
  const [usedPairs, setUsedPairs] = useState<Set<string>>(() => {
    const initialPairs = new Set<string>();
    pastMatches.forEach((match) => {
      const pair1 = [match.team1[0].id, match.team1[1].id].sort().join("-");
      const pair2 = [match.team2[0].id, match.team2[1].id].sort().join("-");
      initialPairs.add(pair1);
      initialPairs.add(pair2);
    });
    return initialPairs;
  });

    // Garante que usedPairs seja atualizado quando pastMatches mudar
    useEffect(() => {
        const initialPairs = new Set<string>();
        pastMatches.forEach((match) => {
          const pair1 = [match.team1[0].id, match.team1[1].id].sort().join("-");
          const pair2 = [match.team2[0].id, match.team2[1].id].sort().join("-");
          initialPairs.add(pair1);
          initialPairs.add(pair2);
        });
        setUsedPairs(initialPairs);
      }, [pastMatches]);

  const generateMatches = () => {
    if (players.length < requiredPlayers) {
      toast.error(
        `Você precisa adicionar ${requiredPlayers} jogadores para gerar as partidas!`
      );
      return;
    }

    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    const numTeams = format === "super8" ? 4 : 6;
    const newMatches: Match[] = [];
    const currentRoundUsedPlayers = new Set<string>(); // Rastreia jogadores usados nesta rodada
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
            !usedPairs.has(pair1) &&
            !currentRoundUsedPlayers.has(player1.id) &&
            !currentRoundUsedPlayers.has(player2.id)
          ) {
            team1 = [player1, player2];
            currentRoundUsedPlayers.add(player1.id);
            currentRoundUsedPlayers.add(player2.id);
            shuffledPlayers.splice(k, 1); // Remove o segundo jogador para não ser reutilizado
            shuffledPlayers.splice(j, 1); // Remove o primeiro jogador
            usedPairs.add(pair1); //adiciona a dupla aos pares já usados
            break;
          }
        }
        if (team1) break; // Se encontrou uma dupla válida, sai do loop
      }

      // Tenta encontrar uma dupla válida para o time 2
      if (team1) {
        for (let j = 0; j < shuffledPlayers.length; j++) {
          for (let k = j + 1; k < shuffledPlayers.length; k++) {
            const player3 = shuffledPlayers[j];
            const player4 = shuffledPlayers[k];
            const pair2 = [player3.id, player4.id].sort().join("-");
            if (
              !usedPairs.has(pair2) &&
              !currentRoundUsedPlayers.has(player3.id) &&
              !currentRoundUsedPlayers.has(player4.id)
            ) {
              team2 = [player3, player4];
              currentRoundUsedPlayers.add(player3.id);
              currentRoundUsedPlayers.add(player4.id);
              shuffledPlayers.splice(k, 1);
              shuffledPlayers.splice(j, 1);
              usedPairs.add(pair2); //adiciona a dupla aos pares já usados
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
        break; // Não foi possível formar as duplas para esta partida
      }
    }

    if (possible) {
      onMatchesGenerated(newMatches);
      toast.success(
        `${newMatches.length} partidas geradas com sucesso para a rodada ${currentRound}!`
      );
    } else {
      toast.error(
        "Não foi possível gerar todas as partidas sem repetições de duplas ou jogadores na mesma rodada.  Desculpe a incompetência."
      );
      onMatchesGenerated([]);
    }
  };

  return (
    <div className="beach-card mt-6">
      <h2 className="text-xl font-bold mb-4 text-beach-darkGray">
        Sortear Partidas
      </h2>
      <p className="text-sm text-gray-600 mb-4">Rodada atual: {currentRound}</p>

      <button
        onClick={generateMatches}
        disabled={players.length < requiredPlayers}
        className={`beach-button-primary w-full flex justify-center items-center gap-2 ${
          players.length < requiredPlayers ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <Users className="h-5 w-5" />
        <span>Sortear Partidas</span>
      </button>

      {players.length < requiredPlayers && (
        <p className="text-beach-red text-sm mt-2">
          Você precisa adicionar {requiredPlayers - players.length} jogadores
          para poder sortear as partidas.
        </p>
      )}
    </div>
  );
}