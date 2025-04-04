import React from 'react';
import { Team, Match, TournamentSettings } from '../types';
import { Trophy, Edit } from 'lucide-react';

interface TournamentBracketProps {
  settings: TournamentSettings;
  matches: Match[];
  onMatchUpdate: (match: Match) => void;
}

export function TournamentBracket({ settings, matches, onMatchUpdate }: TournamentBracketProps) {
  // Função auxiliar para organizar as partidas por fase
  const getRoundMatches = (round: string) => {
    return matches.filter(match => {
      // Ignora partidas de grupo (que têm groupId)
      if (match.groupId) return false;
      
      if (round === 'round16' && match.round === 1) return true;
      if (round === 'quarters' && match.round === 2) return true;
      if (round === 'semis' && match.round === 3) return true;
      if (round === 'final' && match.round === 4) return true;
      return false;
    });
  };
  
  // Obtém as partidas de cada fase
  const round16Matches = getRoundMatches('round16');
  const quartersMatches = getRoundMatches('quarters');
  const semisMatches = getRoundMatches('semis');
  const finalMatch = getRoundMatches('final')[0];
  
  // Função para editar o placar de uma partida
  const handleScoreUpdate = (match: Match) => {
    const score1 = window.prompt("Placar da Dupla 1:", match.score1.toString());
    const score2 = window.prompt("Placar da Dupla 2:", match.score2.toString());
    
    if (score1 !== null && score2 !== null) {
      const s1 = parseInt(score1);
      const s2 = parseInt(score2);
      
      if (!isNaN(s1) && !isNaN(s2)) {
        onMatchUpdate({
          ...match,
          score1: s1,
          score2: s2,
          completed: true
        });
      } else {
        alert("Por favor, informe números válidos");
      }
    }
  };
  
  // Componente para exibir uma partida do bracket
  const BracketMatch = ({ match }: { match: Match }) => (
    <div 
      key={match.id} 
      className="bg-white border rounded-lg p-2 text-sm"
    >
      <div className="font-semibold">{match.team1[0].name} / {match.team1[1].name}</div>
      <div className="text-xs text-gray-500 my-1">vs</div>
      <div className="font-semibold">{match.team2[0].name} / {match.team2[1].name}</div>
      {match.completed ? (
        <div className="mt-1 flex justify-between items-center">
          <div className="text-xs">
            Resultado: {match.score1} - {match.score2}
          </div>
          <button
            onClick={() => handleScoreUpdate(match)}
            className="text-xs flex items-center gap-1 py-1 px-2 bg-beach-blue text-white rounded hover:bg-opacity-90 transition-colors"
          >
            <Edit className="h-3 w-3" />
            <span>Editar</span>
          </button>
        </div>
      ) : (
        <div className="mt-1">
          <button
            onClick={() => handleScoreUpdate(match)}
            className="text-xs py-1 px-2 bg-beach-blue text-white rounded hover:bg-opacity-90 transition-colors"
          >
            Adicionar Placar
          </button>
        </div>
      )}
    </div>
  );
  
  // Componente para exibir um espaço reservado para partidas futuras
  const PlaceholderMatch = ({ message }: { message: string }) => (
    <div className="bg-beach-lightGray border rounded-lg p-2 text-sm text-center">
      {message}
    </div>
  );
  
  return (
    <div className="beach-card mt-6 overflow-x-auto">
      <h2 className="text-xl font-bold mb-4 text-beach-darkGray flex items-center gap-2">
        <Trophy className="h-5 w-5" />
        Chaveamento do Torneio
      </h2>
      
      <div className="min-w-[800px] p-4">
        <div className="flex justify-between">
          {/* Primeira coluna - 16 avos ou grupos */}
          <div className="w-1/4 space-y-4">
            <h3 className="font-bold text-center mb-2">
              {settings.startingRound === 'round16' ? '16 avos de Final' : 'Grupos'}
            </h3>
            
            {settings.startingRound === 'round16' ? (
              // Exibe as partidas de 16 avos de final
              round16Matches.length > 0 ? (
                round16Matches.map(match => (
                  <BracketMatch key={match.id} match={match} />
                ))
              ) : (
                <PlaceholderMatch message="Aguardando definição das partidas" />
              )
            ) : (
              // Exibe os grupos
              settings.groups.map(group => (
                <div key={group.id} className="bg-white border rounded-lg p-2 text-sm">
                  <div className="font-semibold mb-1">{group.name}</div>
                  <ul className="text-xs">
                    {group.teams.map((team) => (
                      <li key={team.id}>{team.name}</li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
          
          {/* Segunda coluna - Quartas de final */}
          <div className="w-1/4 space-y-4 mt-8">
            <h3 className="font-bold text-center mb-2">Quartas de Final</h3>
            
            {quartersMatches.length > 0 ? (
              quartersMatches.map(match => (
                <BracketMatch key={match.id} match={match} />
              ))
            ) : (
              <PlaceholderMatch message="Aguardando fases anteriores" />
            )}
          </div>
          
          {/* Terceira coluna - Semifinais */}
          <div className="w-1/4 space-y-4 mt-16">
            <h3 className="font-bold text-center mb-2">Semifinais</h3>
            
            {semisMatches.length > 0 ? (
              semisMatches.map(match => (
                <BracketMatch key={match.id} match={match} />
              ))
            ) : (
              <PlaceholderMatch message="Aguardando quartas de final" />
            )}
          </div>
          
          {/* Quarta coluna - Final */}
          <div className="w-1/4 space-y-4 mt-24">
            <h3 className="font-bold text-center mb-2">Final</h3>
            
            {finalMatch ? (
              <BracketMatch match={finalMatch} />
            ) : (
              <PlaceholderMatch message="Aguardando semifinais" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}