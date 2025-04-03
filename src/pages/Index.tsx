import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { FormatSelector } from "@/components/FormatSelector";
import { PlayerManagement } from "@/components/PlayerManagement";
import { MatchDrawingSystem } from "@/components/MatchDrawingSystem";
import { MatchCard } from "@/components/MatchCard";
import { Standings } from "@/components/Standings";
import { MatchHistory } from "@/components/MatchHistory";
import { SortingCriteriaSelector } from "@/components/SortingCriteriaSelector";
import { TournamentSetup } from "@/components/TournamentSetup";
import { TournamentBracket } from "@/components/TournamentBracket";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Player, Match, PlayerStats, TournamentFormat, TournamentSettings, Team } from "@/types";
import { 
  SortingCriterion, 
  loadSortingCriteria, 
  saveFormat,
  loadTournamentSettings,
  saveTournamentSettings
} from "@/utils/storage_utils";

const Index = () => {
  const [format, setFormat] = useState<TournamentFormat | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentMatches, setCurrentMatches] = useState<Match[]>([]);
  const [completedMatches, setCompletedMatches] = useState<Match[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [sortingCriteria, setSortingCriteria] = useState<SortingCriterion[]>(
    loadSortingCriteria()
  );
  const [tournamentSettings, setTournamentSettings] = useState<TournamentSettings | null>(
    loadTournamentSettings()
  );
  
  // Calcula as estatísticas dos jogadores baseadas nas partidas
  useEffect(() => {
    const allMatches = [...completedMatches, ...currentMatches.filter(m => m.completed)];
    
    // Inicializa estatísticas para todos os jogadores (tanto individuais quanto em equipes)
    const stats: Record<string, PlayerStats> = {};
    
    // Adiciona jogadores individuais
    players.forEach(player => {
      stats[player.id] = {
        player,
        wins: 0,
        totalGamesWon: 0,
        totalGamesLost: 0,
        gameBalance: 0
      };
    });
    
    // Adiciona jogadores de equipes
    teams.forEach(team => {
      team.players.forEach(player => {
        stats[player.id] = {
          player,
          wins: 0,
          totalGamesWon: 0,
          totalGamesLost: 0,
          gameBalance: 0
        };
      });
    });
    
    // Calcula estatísticas baseadas nas partidas
    allMatches.forEach(match => {
      if (!match.completed) return;
      
      // Time 1 venceu
      if (match.score1 > match.score2) {
        if (stats[match.team1[0].id]) stats[match.team1[0].id].wins++;
        if (stats[match.team1[1].id]) stats[match.team1[1].id].wins++;
      }
      // Time 2 venceu
      else if (match.score2 > match.score1) {
        if (stats[match.team2[0].id]) stats[match.team2[0].id].wins++;
        if (stats[match.team2[1].id]) stats[match.team2[1].id].wins++;
      }
      
      // Adiciona games ganhos/perdidos para jogadores do Time 1
      if (stats[match.team1[0].id]) {
        stats[match.team1[0].id].totalGamesWon += match.score1;
        stats[match.team1[0].id].totalGamesLost += match.score2;
      }
      if (stats[match.team1[1].id]) {
        stats[match.team1[1].id].totalGamesWon += match.score1;
        stats[match.team1[1].id].totalGamesLost += match.score2;
      }
      
      // Adiciona games ganhos/perdidos para jogadores do Time 2
      if (stats[match.team2[0].id]) {
        stats[match.team2[0].id].totalGamesWon += match.score2;
        stats[match.team2[0].id].totalGamesLost += match.score1;
      }
      if (stats[match.team2[1].id]) {
        stats[match.team2[1].id].totalGamesWon += match.score2;
        stats[match.team2[1].id].totalGamesLost += match.score1;
      }
    });
    
    // Calcula saldo de games
    Object.values(stats).forEach(stat => {
      stat.gameBalance = stat.totalGamesWon - stat.totalGamesLost;
    });
    
    setPlayerStats(Object.values(stats));
  }, [players, teams, currentMatches, completedMatches]);
  
  const handleFormatSelect = (selectedFormat: TournamentFormat) => {
    setFormat(selectedFormat);
    saveFormat(selectedFormat);
    setPlayers([]);
    setTeams([]);
    setCurrentMatches([]);
    setCompletedMatches([]);
    setCurrentRound(1);
    setTournamentSettings(null);
  };
  
  const handleMatchesGenerated = (newMatches: Match[]) => {
    setCurrentMatches(newMatches);
  };
  
  const handleMatchUpdate = (updatedMatch: Match) => {
    // Primeiro, verifica se a partida já está nas partidas atuais
    const matchIndex = currentMatches.findIndex(m => m.id === updatedMatch.id);
    
    if (matchIndex >= 0) {
      // Atualiza partidas atuais
      const updatedCurrentMatches = [...currentMatches];
      updatedCurrentMatches[matchIndex] = updatedMatch;
      
      setCurrentMatches(updatedCurrentMatches);
      
      // Se a partida foi concluída, verifica se todas as partidas da rodada atual foram concluídas
      if (updatedMatch.completed) {
        const allCompleted = updatedCurrentMatches.every(match => match.completed);
        
        if (allCompleted) {
          // Move todas as partidas atuais para as partidas concluídas
          setCompletedMatches([...completedMatches, ...updatedCurrentMatches]);
          // Limpa as partidas atuais
          setCurrentMatches([]);
          // Incrementa a rodada atual
          setCurrentRound(prev => prev + 1);
        }
      }
    } else {
      // A partida não está nas partidas atuais, então é uma partida nova (por exemplo, de grupo)
      // ou uma partida do bracket
      
      // Adiciona a partida completada diretamente às partidas concluídas
      if (updatedMatch.completed) {
        setCompletedMatches([...completedMatches, updatedMatch]);
      } else {
        // Se não foi completada, adiciona às partidas atuais
        setCurrentMatches([...currentMatches, updatedMatch]);
      }
    }
  };
  
  const handleTournamentSettingsChange = (settings: TournamentSettings) => {
    setTournamentSettings(settings);
    saveTournamentSettings(settings);
  };
  
  return (
    <div className="min-h-screen bg-beach-lightGray">
      <Header />
      
      <main className="container mx-auto px-4 py-6 pb-20">
        {/* Seleção de Formato */}
        <FormatSelector 
          onFormatSelect={handleFormatSelect} 
          selectedFormat={format} 
        />
        
        {format && (
          <>
            {/* Gerenciamento de Jogadores ou Times */}
            {format === 'tournament' ? (
              <PlayerManagement 
                players={players} 
                setPlayers={setPlayers} 
                format={format}
                teams={teams}
                setTeams={setTeams}
              />
            ) : (
              <PlayerManagement 
                players={players} 
                setPlayers={setPlayers} 
                format={format} 
              />
            )}
            
            {/* Critérios de Classificação */}
            <SortingCriteriaSelector onCriteriaChange={setSortingCriteria} />
            
            {/* Componentes específicos para o formato de torneio */}
            {format === 'tournament' && (
              <TournamentSetup 
                teams={teams}
                onSettingsChange={handleTournamentSettingsChange}
                currentMatches={currentMatches}
                completedMatches={completedMatches}
                onMatchUpdate={handleMatchUpdate}
              />
            )}
            
            {/* Interface Principal do Torneio */}
            <Tabs defaultValue="matches" className="mt-6">
              <TabsList className="w-full bg-white">
                <TabsTrigger value="matches" className="flex-1">Partidas</TabsTrigger>
                <TabsTrigger value="standings" className="flex-1">Classificação</TabsTrigger>
                <TabsTrigger value="history" className="flex-1">Histórico</TabsTrigger>
                {format === 'tournament' && (
                  <TabsTrigger value="bracket" className="flex-1">Chaveamento</TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="matches" className="mt-4">
                {/* Sistema de Sorteio de Partidas */}
                {format !== 'tournament' && (
                  <MatchDrawingSystem 
                    players={players}
                    format={format}
                    currentRound={currentRound}
                    pastMatches={completedMatches}
                    onMatchesGenerated={handleMatchesGenerated}
                  />
                )}
                
                {/* Partidas Atuais */}
                {currentMatches.length > 0 && (
                  <div className="mt-6">
                    <h2 className="text-xl font-bold mb-4 text-beach-darkGray">Partidas Atuais</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {currentMatches.filter(m => !m.groupId).map(match => (
                        <MatchCard 
                          key={match.id} 
                          match={match} 
                          onMatchUpdate={handleMatchUpdate} 
                        />
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="standings" className="mt-4">
                <Standings 
                  playerStats={playerStats} 
                  sortingCriteria={sortingCriteria}
                />
              </TabsContent>
              
              <TabsContent value="history" className="mt-4">
                <MatchHistory matches={completedMatches} />
              </TabsContent>
              
              {format === 'tournament' && (
                <TabsContent value="bracket" className="mt-4">
                  {tournamentSettings && (
                    <TournamentBracket 
                      settings={tournamentSettings}
                      matches={[...currentMatches, ...completedMatches]}
                      onMatchUpdate={handleMatchUpdate}
                    />
                  )}
                </TabsContent>
              )}
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;