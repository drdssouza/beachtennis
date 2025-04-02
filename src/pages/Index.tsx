import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { FormatSelector } from "@/components/FormatSelector";
import { PlayerManagement } from "@/components/PlayerManagement";
import { MatchDrawingSystem } from "@/components/MatchDrawingSystem";
import { MatchCard } from "@/components/MatchCard";
import { Standings } from "@/components/Standings";
import { MatchHistory } from "@/components/MatchHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Player, Match, PlayerStats, TournamentFormat } from "@/types";
import { loadUsedPairs, saveUsedPairs } from "@/components/ui/storage_utils"; 

const Index = () => {
  const [format, setFormat] = useState<TournamentFormat | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentMatches, setCurrentMatches] = useState<Match[]>([]);
  const [completedMatches, setCompletedMatches] = useState<Match[]>(() => {
    if (typeof window !== 'undefined'){
      const savedCompletedMatches = localStorage.getItem('completedMatches');
      return savedCompletedMatches ? JSON.parse(savedCompletedMatches) : [];
    }
    return [];
  });
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [usedPairs, setUsedPairs] = useState<Set<string>>(() => { // Usar o estado para usedPairs
    return loadUsedPairs();
  });

  // Salvar completedMatches no localStorage
  useEffect(() => {
    if (typeof window !== 'undefined'){
      localStorage.setItem('completedMatches', JSON.stringify(completedMatches));
    }
  }, [completedMatches]);

  // Salvar usedPairs no localStorage
  useEffect(() => {
    saveUsedPairs(usedPairs);
  }, [usedPairs]);
  
  // Calculate player stats whenever matches change
  useEffect(() => {
    const allMatches = [...completedMatches, ...currentMatches.filter(m => m.completed)];
    
    // Initialize stats for all players
    const stats: Record<string, PlayerStats> = {};
    players.forEach(player => {
      stats[player.id] = {
        player,
        wins: 0,
        totalGamesWon: 0,
        totalGamesLost: 0,
        gameBalance: 0
      };
    });
    
    // Calculate stats based on matches
    allMatches.forEach(match => {
      if (!match.completed) return;
      
      // Team 1 won
      if (match.score1 > match.score2) {
        stats[match.team1[0].id].wins++;
        stats[match.team1[1].id].wins++;
      }
      // Team 2 won
      else if (match.score2 > match.score1) {
        stats[match.team2[0].id].wins++;
        stats[match.team2[1].id].wins++;
      }
      
      // Add games won/lost for Team 1 players
      stats[match.team1[0].id].totalGamesWon += match.score1;
      stats[match.team1[1].id].totalGamesWon += match.score1;
      stats[match.team1[0].id].totalGamesLost += match.score2;
      stats[match.team1[1].id].totalGamesLost += match.score2;
      
      // Add games won/lost for Team 2 players
      stats[match.team2[0].id].totalGamesWon += match.score2;
      stats[match.team2[1].id].totalGamesWon += match.score2;
      stats[match.team2[0].id].totalGamesLost += match.score1;
      stats[match.team2[1].id].totalGamesLost += match.score1;
    });
    
    // Calculate game balance
    Object.values(stats).forEach(stat => {
      stat.gameBalance = stat.totalGamesWon - stat.totalGamesLost;
    });
    
    setPlayerStats(Object.values(stats));
  }, [players, currentMatches, completedMatches]);
  
  const handleFormatSelect = (selectedFormat: TournamentFormat) => {
    setFormat(selectedFormat);
    setPlayers([]);
    setCurrentMatches([]);
    setCompletedMatches([]);
    setCurrentRound(1);
    setUsedPairs(new Set()); // Limpa as duplas usadas ao mudar o formato
    if (typeof window !== 'undefined'){
      localStorage.removeItem(STORAGE_KEY);
    }
  };
  
  const handleMatchesGenerated = (newMatches: Match[]) => {
    setCurrentMatches(newMatches);
  };
  
  const handleMatchUpdate = (updatedMatch: Match) => {
    // Update current matches
    const updatedCurrentMatches = currentMatches.map(match => 
      match.id === updatedMatch.id ? updatedMatch : match
    );
    
    setCurrentMatches(updatedCurrentMatches);
    
    // Check if all matches in the current round are completed
    const allCompleted = updatedCurrentMatches.every(match => match.completed);
    
    if (allCompleted) {
      // Move all current matches to completed matches
      setCompletedMatches([...completedMatches, ...updatedCurrentMatches]);
      // Clear current matches
      setCurrentMatches([]);
      // Increment current round
      setCurrentRound(prev => prev + 1);
    }

    // Atualiza usedPairs com as duplas da partida atualizada
    const updatedPair1 = [updatedMatch.team1[0].id, updatedMatch.team1[1].id].sort().join('-');
    const updatedPair2 = [updatedMatch.team2[0].id, updatedMatch.team2[1].id].sort().join('-');

    setUsedPairs(prevPairs => {
      const newPairs = new Set(prevPairs);
      newPairs.add(updatedPair1);
      newPairs.add(updatedPair2);
      return newPairs;
    });
  };
  
  return (
    <div className="min-h-screen bg-beach-lightGray">
      <Header />
      
      <main className="container mx-auto px-4 py-6 pb-20">
        {/* Format Selection */}
        <FormatSelector 
          onFormatSelect={handleFormatSelect} 
          selectedFormat={format} 
        />
        
        {format && (
          <>
            {/* Player Management */}
            <PlayerManagement 
              players={players} 
              setPlayers={setPlayers} 
              format={format} 
            />
            
            {/* Main Tournament Interface */}
            <Tabs defaultValue="matches" className="mt-6">
              <TabsList className="w-full bg-white">
                <TabsTrigger value="matches" className="flex-1">Partidas</TabsTrigger>
                <TabsTrigger value="standings" className="flex-1">Classificação</TabsTrigger>
                <TabsTrigger value="history" className="flex-1">Histórico</TabsTrigger>
              </TabsList>
              
              <TabsContent value="matches" className="mt-4">
                {/* Match Drawing System */}
                <MatchDrawingSystem 
                  players={players}
                  format={format}
                  currentRound={currentRound}
                  pastMatches={completedMatches} // Passa completedMatches para o componente
                  onMatchesGenerated={handleMatchesGenerated}
                />
                
                {/* Current Matches */}
                {currentMatches.length > 0 && (
                  <div className="mt-6">
                    <h2 className="text-xl font-bold mb-4 text-beach-darkGray">Partidas Atuais</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {currentMatches.map(match => (
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
                <Standings playerStats={playerStats} />
              </TabsContent>
              
              <TabsContent value="history" className="mt-4">
                <MatchHistory matches={completedMatches} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
