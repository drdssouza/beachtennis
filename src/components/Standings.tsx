import { PlayerStats } from "../types";
import { Trophy } from "lucide-react";
import { SortingCriterion } from "../utils/storage_utils";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StandingsProps {
  playerStats: PlayerStats[];
  sortingCriteria: SortingCriterion[];
}

export function Standings({ playerStats, sortingCriteria }: StandingsProps) {
  // Função auxiliar para comparar estatísticas usando os critérios personalizados
  const comparePlayerStats = (a: PlayerStats, b: PlayerStats): number => {
    for (const criterion of sortingCriteria) {
      // Para games perdidos, menor é melhor (ordem inversa)
      if (criterion === 'totalGamesLost') {
        if (a[criterion] !== b[criterion]) {
          return a[criterion] - b[criterion]; // Ordem crescente
        }
      } 
      // Para todos os outros critérios, maior é melhor
      else if (a[criterion] !== b[criterion]) {
        return b[criterion] - a[criterion]; // Ordem decrescente
      }
    }
    return 0; // Empate em todos os critérios
  };
  
  const sortedStats = [...playerStats].sort(comparePlayerStats);
  
  return (
    <div className="beach-card mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="text-beach-yellow h-6 w-6" />
        <h2 className="text-xl font-bold text-beach-darkGray">Classificação</h2>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-beach-lightGray">
              <TableHead className="w-16">Pos.</TableHead>
              <TableHead>Jogador</TableHead>
              <TableHead className="text-center">Jogos</TableHead>
              <TableHead className="text-center">Vitórias</TableHead>
              <TableHead className="text-center">Games Ganhos</TableHead>
              <TableHead className="text-center">Games Perdidos</TableHead>
              <TableHead className="text-center">Saldo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStats.map((stat, index) => (
              <TableRow key={stat.player.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">
                  {index === 0 ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-beach-yellow text-beach-darkGray rounded-full font-bold">1</span>
                  ) : index === 1 ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-300 text-beach-darkGray rounded-full font-bold">2</span>
                  ) : index === 2 ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-amber-600 text-white rounded-full font-bold">3</span>
                  ) : (
                    <span className="pl-2">{index + 1}</span>
                  )}
                </TableCell>
                <TableCell className="font-medium">{stat.player.name}</TableCell>
                <TableCell className="text-center">{stat.matchesPlayed}</TableCell>
                <TableCell className="text-center font-bold">{stat.wins}</TableCell>
                <TableCell className="text-center">{stat.totalGamesWon}</TableCell>
                <TableCell className="text-center">{stat.totalGamesLost}</TableCell>
                <TableCell className={`text-center font-medium ${
                  stat.gameBalance > 0 ? 'text-beach-green' :
                  stat.gameBalance < 0 ? 'text-beach-red' : ''
                }`}>
                  {stat.gameBalance > 0 ? `+${stat.gameBalance}` : stat.gameBalance}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>Critérios de desempate:</p>
        <ol className="list-decimal pl-5 mt-1">
          {sortingCriteria.map((criterion, index) => (
            <li key={index}>
              {criterion === 'wins' && 'Vitórias'}
              {criterion === 'gameBalance' && 'Saldo de Games'}
              {criterion === 'totalGamesWon' && 'Games Ganhos'}
              {criterion === 'totalGamesLost' && 'Games Perdidos (quanto menos, melhor)'}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
