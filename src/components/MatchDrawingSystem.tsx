import React, { useState } from "react";
import { Player, Match, Round } from "../types";
import { Users, ChevronDown, ChevronUp } from "lucide-react";
import { useMatchGeneration } from "../hooks/useMatchGeneration";
import { Button } from "./ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { MatchCard } from "./MatchCard";
import { toast } from "sonner";

interface MatchDrawingSystemProps {
  players: Player[];
  pastMatches: Match[];
  currentMatches: Match[];
  onMatchesGenerated: (matches: Match[]) => void;
  onMatchUpdate: (updatedMatch: Match) => void;
}

export function MatchDrawingSystem({
  players,
  pastMatches,
  currentMatches,
  onMatchesGenerated,
  onMatchUpdate,
}: MatchDrawingSystemProps) {
  const { generateAllMatches, allRounds, tournamentComplete, requiredPlayers } = useMatchGeneration(
    players,
    pastMatches
  );
  const [generatedRounds, setGeneratedRounds] = useState<Round[]>([]);
  const [expandedRound, setExpandedRound] = useState<number | null>(null);

  // Group current matches by round
  const groupMatchesByRound = (matches: Match[]): Record<number, Match[]> => {
    const grouped: Record<number, Match[]> = {};
    
    matches.forEach(match => {
      if (!grouped[match.round]) {
        grouped[match.round] = [];
      }
      grouped[match.round].push(match);
    });
    
    return grouped;
  };
  
  const currentMatchesByRound = groupMatchesByRound(currentMatches);
  const completedMatchesByRound = groupMatchesByRound(pastMatches);
  
  // Combine and get all unique round numbers
  const allRoundNumbers = new Set([
    ...Object.keys(currentMatchesByRound).map(Number),
    ...Object.keys(completedMatchesByRound).map(Number)
  ]);
  const sortedRoundNumbers = Array.from(allRoundNumbers).sort((a, b) => a - b);

  const handleGenerateMatches = () => {
    generateAllMatches((rounds) => {
      setGeneratedRounds(rounds);
      // Notify the parent component about all generated matches
      const allMatches = rounds.flatMap(round => round.matches);
      onMatchesGenerated(allMatches);
    });
  };

  const toggleRound = (roundNumber: number) => {
    setExpandedRound(expandedRound === roundNumber ? null : roundNumber);
  };

  return (
    <div className="mt-8 bg-white rounded-xl shadow p-6">
      <h2 className="text-2xl font-bold mb-6 text-beach-darkGray border-b pb-4">
        Gerenciar Rodadas do Torneio
      </h2>

      {tournamentComplete ? (
        <div className="p-5 bg-green-50 border border-green-200 rounded-lg mb-4">
          <p className="text-green-700 font-medium text-center text-lg">
            Parabéns! Todas as combinações de duplas possíveis foram realizadas.
            O torneio está completo!
          </p>
        </div>
      ) : (
        <>
          {currentMatches.length === 0 ? (
            <>
              <Button
                onClick={handleGenerateMatches}
                disabled={players.length !== 8 && players.length !== 12}
                className={`py-6 w-full flex justify-center items-center gap-3 text-lg ${
                  (players.length !== 8 && players.length !== 12) ? "opacity-50 cursor-not-allowed bg-gray-400" : 
                  "bg-gradient-to-r from-beach-blue to-beach-teal text-white hover:opacity-90"
                }`}
              >
                <Users className="h-5 w-5" />
                <span>Gerar TODAS as Rodadas do Torneio</span>
              </Button>
              
              {players.length < requiredPlayers && (
                <p className="text-beach-red text-base mt-4 p-3 bg-red-50 rounded-lg">
                  Você precisa adicionar {requiredPlayers - players.length} jogadores
                  para poder gerar as partidas.
                </p>
              )}
              
              {players.length > 0 && players.length !== 8 && players.length !== 12 && (
                <p className="text-beach-red text-base mt-4 p-3 bg-red-50 rounded-lg">
                  Este sistema só funciona com exatamente 8 jogadores (Super 8) ou 12 jogadores (Super 12).
                </p>
              )}
              
              <p className="text-sm text-gray-600 mt-5 p-4 bg-gray-50 rounded-lg">
                Este botão irá gerar TODAS as rodadas do torneio de uma vez só. 
                Todas as combinações possíveis serão calculadas e distribuídas nas rodadas.
              </p>
            </>
          ) : (
            <div className="space-y-8">
              <h3 className="text-xl font-semibold mb-4 text-beach-darkGray">Rodadas do Torneio</h3>
              
              {sortedRoundNumbers.map((roundNumber) => {
                // Get all matches for this round (both current and completed)
                const roundMatches = [
                  ...(currentMatchesByRound[roundNumber] || []),
                  ...(completedMatchesByRound[roundNumber] || [])
                ];
                
                if (roundMatches.length === 0) return null;
                
                return (
                  <Collapsible 
                    key={roundNumber}
                    open={expandedRound === roundNumber}
                    onOpenChange={() => toggleRound(roundNumber)}
                    className="border rounded-xl overflow-hidden shadow-sm mb-6"
                  >
                    <CollapsibleTrigger asChild>
                      <div className="p-5 bg-gradient-to-r from-beach-blue to-beach-teal text-white cursor-pointer hover:opacity-90 transition-opacity flex justify-between items-center">
                        <h4 className="font-bold text-xl">Rodada {roundNumber}</h4>
                        <div className="flex items-center gap-2">
                          <span className="bg-white text-beach-darkGray px-2 py-1 rounded-full text-sm">
                            {roundMatches.filter(m => m.completed).length}/{roundMatches.length} jogos
                          </span>
                          {expandedRound === roundNumber ? (
                            <ChevronUp className="h-6 w-6" />
                          ) : (
                            <ChevronDown className="h-6 w-6" />
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="p-6 bg-gray-50">
                        <div className="grid gap-8">
                          {roundMatches.map((match, index) => (
                            <div key={match.id} className="bg-white rounded-xl shadow-sm">
                              <div className="bg-gray-100 py-2 px-5 rounded-t-xl flex justify-between items-center">
                                <h5 className="font-medium text-beach-darkGray">Partida {index + 1}</h5>
                                {match.completed && (
                                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                    Finalizada
                                  </span>
                                )}
                              </div>
                              <div className="p-4">
                                <MatchCard 
                                  match={match} 
                                  onMatchUpdate={onMatchUpdate}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
              
              <div className="flex justify-center mt-6">
                <Button
                  onClick={handleGenerateMatches}
                  disabled={players.length !== 8 && players.length !== 12}
                  className="bg-beach-orange hover:bg-beach-orange/90 text-white"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Regenerar Rodadas
                </Button>
              </div>
              
              <p className="text-sm text-gray-600 mt-4 p-4 bg-gray-50 rounded-lg">
                Clique em cada rodada para expandir e ver os detalhes das partidas. 
                Você pode editar os resultados das partidas a qualquer momento.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
