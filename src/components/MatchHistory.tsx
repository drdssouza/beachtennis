import { Match } from "../types";

interface MatchHistoryProps {
  matches: Match[];
}

export function MatchHistory({ matches }: MatchHistoryProps) {
  // Group matches by round
  const matchesByRound: Record<number, Match[]> = {};
  
  matches.forEach(match => {
    if (!matchesByRound[match.round]) {
      matchesByRound[match.round] = [];
    }
    matchesByRound[match.round].push(match);
  });
  
  // Sort rounds in descending order
  const rounds = Object.keys(matchesByRound)
    .map(Number)
    .sort((a, b) => b - a);
  
  return (
    <div className="beach-card mt-6">
      <h2 className="text-xl font-bold mb-4 text-beach-darkGray">Histórico de Partidas</h2>
      
      {rounds.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          Nenhuma partida realizada
        </div>
      ) : (
        <div className="space-y-6">
          {rounds.map(round => (
            <div key={round}>
              <h3 className="font-bold text-lg mb-3 bg-beach-lightGray px-3 py-2 rounded-lg">
                Rodada {round}
              </h3>
              
              <div className="space-y-3">
                {matchesByRound[round].map(match => (
                  <div key={match.id} className="border border-gray-200 rounded-lg p-3 bg-white">
                    <div className="grid grid-cols-3 items-center">
                      <div className="col-span-1">
                        <div className="text-sm font-medium">{match.team1[0].name}</div>
                        <div className="text-sm font-medium">{match.team1[1].name}</div>
                      </div>
                      
                      <div className="col-span-1 flex justify-center">
                        <div className={`font-bold ${
                          match.score1 > match.score2 ? 'text-beach-green' :
                          match.score1 < match.score2 ? 'text-beach-red' : ''
                        }`}>
                          {match.score1}
                        </div>
                        <div className="mx-1">:</div>
                        <div className={`font-bold ${
                          match.score2 > match.score1 ? 'text-beach-green' :
                          match.score2 < match.score1 ? 'text-beach-red' : ''
                        }`}>
                          {match.score2}
                        </div>
                      </div>
                      
                      <div className="col-span-1 text-right">
                        <div className="text-sm font-medium">{match.team2[0].name}</div>
                        <div className="text-sm font-medium">{match.team2[1].name}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
