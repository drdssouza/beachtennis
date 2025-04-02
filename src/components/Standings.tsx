import { PlayerStats } from "../types";
import { Trophy } from "lucide-react";

interface StandingsProps {
  playerStats: PlayerStats[];
}

export function Standings({ playerStats }: StandingsProps) {
  // Sort by: 1) wins, 2) game balance, 3) total games won
  const sortedStats = [...playerStats].sort((a, b) => {
    if (a.wins !== b.wins) return b.wins - a.wins;
    if (a.gameBalance !== b.gameBalance) return b.gameBalance - a.gameBalance;
    return b.totalGamesWon - a.totalGamesWon;
  });
  
  return (
    <div className="beach-card mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="text-beach-yellow h-6 w-6" />
        <h2 className="text-xl font-bold text-beach-darkGray">Classificação</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-beach-lightGray">
              <th className="p-3 text-left">Pos.</th>
              <th className="p-3 text-left">Jogador</th>
              <th className="p-3 text-center">Vitórias</th>
              <th className="p-3 text-center">Games Ganhos</th>
              <th className="p-3 text-center">Games Perdidos</th>
              <th className="p-3 text-center">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {sortedStats.map((stat, index) => (
              <tr key={stat.player.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-3 text-left">
                  {index === 0 ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-beach-yellow text-beach-darkGray rounded-full font-bold">1</span>
                  ) : index === 1 ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-300 text-beach-darkGray rounded-full font-bold">2</span>
                  ) : index === 2 ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-amber-600 text-white rounded-full font-bold">3</span>
                  ) : (
                    <span className="pl-2">{index + 1}</span>
                  )}
                </td>
                <td className="p-3 text-left font-medium">{stat.player.name}</td>
                <td className="p-3 text-center font-bold">{stat.wins}</td>
                <td className="p-3 text-center">{stat.totalGamesWon}</td>
                <td className="p-3 text-center">{stat.totalGamesLost}</td>
                <td className={`p-3 text-center font-medium ${
                  stat.gameBalance > 0 ? 'text-beach-green' :
                  stat.gameBalance < 0 ? 'text-beach-red' : ''
                }`}>
                  {stat.gameBalance > 0 ? `+${stat.gameBalance}` : stat.gameBalance}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
