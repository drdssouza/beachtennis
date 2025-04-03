import React, { useState, useEffect } from 'react';
import { Team, TournamentSettings, TournamentGroup, Match } from '../types';
import { Users, Settings, Plus, Trash2, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from './ui/input';

interface TournamentSetupProps {
  teams: Team[];
  onSettingsChange: (settings: TournamentSettings) => void;
  currentMatches: Match[];
  completedMatches: Match[];
  onMatchUpdate: (updatedMatch: Match) => void;
}

export function TournamentSetup({ 
  teams, 
  onSettingsChange,
  currentMatches,
  completedMatches,
  onMatchUpdate
}: TournamentSetupProps) {
  const [numberOfGroups, setNumberOfGroups] = useState(2);
  const [startingRound, setStartingRound] = useState<'round16' | 'quarters' | 'semis' | 'final'>('quarters');
  const [groups, setGroups] = useState<TournamentGroup[]>([]);
  const [groupMatches, setGroupMatches] = useState<Match[]>([]);

  // Gera grupos automaticamente de forma aleatória
  const generateGroups = () => {
    if (teams.length < 2) {
      toast.error("É necessário pelo menos 2 duplas para o torneio");
      return;
    }

    if (numberOfGroups < 1) {
      toast.error("É necessário pelo menos 1 grupo");
      return;
    }

    if (numberOfGroups > teams.length) {
      toast.error(`Número de grupos muito alto. Máximo permitido: ${teams.length}`);
      return;
    }

    // Embaralha as duplas
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
    
    // Calcula quantas duplas por grupo
    const teamsPerGroup = Math.floor(teams.length / numberOfGroups);
    const extraTeams = teams.length % numberOfGroups;
    
    // Divide as duplas em grupos
    const newGroups: TournamentGroup[] = [];
    let teamIndex = 0;
    
    for (let i = 0; i < numberOfGroups; i++) {
      // Se houver duplas extras, adicione uma a mais nos primeiros grupos
      // Isso garante que a diferença entre qualquer grupo seja de no máximo 1 dupla
      const groupSize = i < extraTeams ? teamsPerGroup + 1 : teamsPerGroup;
      const groupTeams = shuffledTeams.slice(teamIndex, teamIndex + groupSize);
      teamIndex += groupSize;
      
      newGroups.push({
        id: crypto.randomUUID(),
        name: `Grupo ${String.fromCharCode(65 + i)}`, // A, B, C, etc.
        teams: groupTeams
      });
    }
    
    setGroups(newGroups);
    
    // Gera as partidas dentro de cada grupo (todos contra todos)
    generateGroupMatches(newGroups);
    
    // Atualiza as configurações
    const settings: TournamentSettings = {
      numberOfGroups,
      startingRound,
      groups: newGroups
    };
    
    onSettingsChange(settings);
    
    // Mostra mensagem com informação sobre a distribuição das duplas
    const distribution = newGroups.map(g => g.teams.length).join(', ');
    toast.success(`${numberOfGroups} grupos gerados com sucesso! Distribuição: ${distribution} duplas por grupo`);
  };

  // Gera partidas dentro dos grupos (todos contra todos)
  const generateGroupMatches = (groups: TournamentGroup[]) => {
    const newMatches: Match[] = [];
    let round = 1;

    groups.forEach(group => {
      const teams = group.teams;
      
      // Gera todas as combinações possíveis (todos contra todos)
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          newMatches.push({
            id: crypto.randomUUID(),
            team1: teams[i].players,
            team2: teams[j].players,
            score1: 0,
            score2: 0,
            round: round,
            completed: false,
            groupId: group.id
          });
        }
      }
    });

    setGroupMatches(newMatches);
  };

  // Manipulador para alteração do número de grupos
  const handleNumberOfGroupsChange = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num > 0) {
      setNumberOfGroups(num);
    }
  };

  // Manipulador para alteração da fase inicial
  const handleStartingRoundChange = (value: string) => {
    setStartingRound(value as 'round16' | 'quarters' | 'semis' | 'final');
  };

  // Calcula o número máximo de grupos permitidos
  const maxGroups = teams.length;

  // Filtra as partidas de grupo
  const filterGroupMatches = (groupId: string) => {
    const allMatches = [...currentMatches, ...completedMatches, ...groupMatches];
    return allMatches.filter(m => m.groupId === groupId);
  };

  // Atualiza uma partida
  const updateMatch = (match: Match) => {
    // Atualiza a partida nos matches do grupo
    const updatedGroupMatches = groupMatches.map(m => 
      m.id === match.id ? match : m
    );
    setGroupMatches(updatedGroupMatches.filter(m => !m.completed));
    
    // Passa a partida atualizada para o componente pai
    onMatchUpdate(match);
  };

  return (
    <div className="beach-card mt-6">
      <h2 className="text-xl font-bold mb-4 text-beach-darkGray flex items-center gap-2">
        <Settings className="h-5 w-5" />
        Configuração do Torneio
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="numberOfGroups" className="block text-sm font-medium mb-1">
            Número de Grupos
          </label>
          <Input
            id="numberOfGroups"
            type="number"
            min="1"
            max={maxGroups > 0 ? maxGroups : 1}
            value={numberOfGroups}
            onChange={(e) => handleNumberOfGroupsChange(e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Máximo permitido: {maxGroups || 1} grupos
          </p>
        </div>

        <div>
          <label htmlFor="startingRound" className="block text-sm font-medium mb-1">
            Fase Inicial do Mata-Mata
          </label>
          <Select
            value={startingRound}
            onValueChange={handleStartingRoundChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione a fase inicial" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="round16">16 avos de Final</SelectItem>
              <SelectItem value="quarters">Quartas de Final</SelectItem>
              <SelectItem value="semis">Semifinais</SelectItem>
              <SelectItem value="final">Final</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={generateGroups}
        className="beach-button-primary w-full flex justify-center items-center gap-2 mb-6"
        disabled={teams.length < 2}
      >
        <Users className="h-5 w-5" />
        <span>Gerar Grupos e Jogos</span>
      </Button>

      {groups.length > 0 && (
        <div className="mt-4">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-beach-darkGray" />
            Grupos e Jogos
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {groups.map((group) => (
              <div key={group.id} className="bg-beach-lightGray p-4 rounded-lg">
                <h4 className="font-semibold mb-2">{group.name} ({group.teams.length} duplas)</h4>
                
                {/* Lista de times no grupo */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium mb-1">Duplas:</h5>
                  <ul className="space-y-1">
                    {group.teams.map((team) => (
                      <li key={team.id} className="bg-white p-2 rounded text-sm">
                        {team.name}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Partidas do grupo */}
                <div>
                  <h5 className="text-sm font-medium mb-1">Jogos:</h5>
                  <div className="space-y-2">
                    {filterGroupMatches(group.id).map(match => (
                      <div key={match.id} className="bg-white p-2 rounded border">
                        <div className="text-xs mb-1">Partida {match.id.slice(0, 4)}</div>
                        <div className="flex justify-between items-center text-sm">
                          <div className="w-2/5 truncate">{match.team1[0].name}/{match.team1[1].name}</div>
                          
                          {match.completed ? (
                            <div className="w-1/5 text-center font-medium">
                              {match.score1} - {match.score2}
                            </div>
                          ) : (
                            <div className="w-1/5 text-center">
                              <Button 
                                onClick={() => {
                                  const score1 = window.prompt("Placar da Dupla 1:", "0");
                                  const score2 = window.prompt("Placar da Dupla 2:", "0");
                                  
                                  if (score1 !== null && score2 !== null) {
                                    const s1 = parseInt(score1);
                                    const s2 = parseInt(score2);
                                    
                                    if (!isNaN(s1) && !isNaN(s2)) {
                                      updateMatch({
                                        ...match,
                                        score1: s1,
                                        score2: s2,
                                        completed: true
                                      });
                                    }
                                  }
                                }}
                                size="sm"
                                variant="outline"
                                className="text-xs py-0 h-6"
                              >
                                Resultado
                              </Button>
                            </div>
                          )}
                          
                          <div className="w-2/5 truncate text-right">{match.team2[0].name}/{match.team2[1].name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {teams.length < 2 && (
        <p className="text-beach-red text-sm mt-2">
          É necessário pelo menos 2 duplas para configurar o torneio.
        </p>
      )}
    </div>
  );
}