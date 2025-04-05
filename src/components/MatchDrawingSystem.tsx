import React from "react";
import { Player, Match, TournamentFormat } from "../types";
import { Users } from "lucide-react";
import { useMatchGeneration } from "../hooks/useMatchGeneration";
import { TournamentCompleteMessage } from "./TournamentCompleteMessage";
import { Button } from "./ui/button";

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
  const { generateMatches, tournamentComplete, requiredPlayers } = useMatchGeneration(
    players,
    format,
    currentRound,
    pastMatches
  );

  const handleGenerateMatches = () => {
    generateMatches(onMatchesGenerated);
  };

  return (
    <div className="beach-card mt-6">
      <h2 className="text-xl font-bold mb-4 text-beach-darkGray">
        Gerar Todas as Partidas
      </h2>
      <p className="text-sm text-gray-600 mb-4">Rodada atual: {currentRound}</p>

      <TournamentCompleteMessage isVisible={tournamentComplete} />

      {!tournamentComplete && (
        <>
          <Button
            onClick={handleGenerateMatches}
            disabled={players.length < requiredPlayers}
            className={`beach-button-primary w-full flex justify-center items-center gap-2 ${
              players.length < requiredPlayers ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Users className="h-5 w-5" />
            <span>Gerar Todas as Partidas Possíveis</span>
          </Button>
          
          {players.length < requiredPlayers && (
            <p className="text-beach-red text-sm mt-2">
              Você precisa adicionar {requiredPlayers - players.length} jogadores
              para poder gerar as partidas.
            </p>
          )}
          
          <p className="text-sm text-gray-500 mt-3">
            Este botão irá gerar todas as combinações possíveis de duplas que ainda não jogaram juntas.
            As partidas serão adicionadas automaticamente ao sistema.
          </p>
        </>
      )}
    </div>
  );
}