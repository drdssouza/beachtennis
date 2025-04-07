import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { FormatSelector } from "@/components/FormatSelector";
import { PlayerManagement } from "@/components/PlayerManagement";
import { MatchDrawingSystem } from "@/components/MatchDrawingSystem";
import { MatchCard } from "@/components/MatchCard";
import { Standings } from "@/components/Standings";
import { MatchHistory } from "@/components/MatchHistory";
import { SortingCriteriaSelector } from "@/components/SortingCriteriaSelector";
import { EventManager } from "@/components/EventManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Player, Match, PlayerStats, TournamentFormat, Event } from "@/types";
import { 
  SortingCriterion, 
  loadSortingCriteria, 
  saveFormat
} from "@/utils/storage_utils";
import { toast } from "sonner";
import { generateEventCode } from "@/utils/event_utils";

const Index = () => {
  const [format, setFormat] = useState<TournamentFormat | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentMatches, setCurrentMatches] = useState<Match[]>([]);
  const [completedMatches, setCompletedMatches] = useState<Match[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [sortingCriteria, setSortingCriteria] = useState<SortingCriterion[]>(
    loadSortingCriteria()
  );
  const [activeView, setActiveView] = useState<'create' | 'view'>('create');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  // Calcula as estatísticas dos jogadores baseadas nas partidas
  useEffect(() => {
    // ... keep existing code (statistics calculation)
  }, [players, currentMatches, completedMatches]);
  
  const handleFormatSelect = (selectedFormat: TournamentFormat) => {
    // Filtramos para aceitar apenas os formatos super8 e super12
    if (selectedFormat === 'super8' || selectedFormat === 'super12') {
      setFormat(selectedFormat);
      saveFormat(selectedFormat);
      setPlayers([]);
      setCurrentMatches([]);
      setCompletedMatches([]);
      setActiveView('create');
      
      // Automatically create a new event
      const eventName = selectedFormat === 'super8' ? 'Super 8' : 'Super 12';
      const uniqueCode = generateEventCode();
      const newEvent: Event = {
        id: crypto.randomUUID(),
        name: `${eventName} - ${new Date().toLocaleDateString()}`,
        code: uniqueCode,
        format: selectedFormat,
        createdAt: new Date(),
        players: [],
        matches: [],
        completedMatches: []
      };
      
      setSelectedEvent(newEvent);
      toast.success(`Evento "${newEvent.name}" criado com código: ${uniqueCode}`);
    } else {
      toast.error("Formato de torneio não disponível no momento.");
    }
  };
  
  const handleMatchesGenerated = (newMatches: Match[]) => {
    setCurrentMatches(newMatches);
    
    // Also update the selected event with the new matches
    if (selectedEvent) {
      setSelectedEvent({
        ...selectedEvent,
        matches: newMatches
      });
    }
  };
  
  const handleMatchUpdate = (updatedMatch: Match) => {
    let updatedCurrentMatches = [...currentMatches];
    let updatedCompletedMatches = [...completedMatches];
    
    const matchIndex = currentMatches.findIndex(m => m.id === updatedMatch.id);
    
    if (matchIndex >= 0) {
      // Update the match in current matches
      updatedCurrentMatches[matchIndex] = updatedMatch;
      
      // If match is completed, also add to completed matches
      if (updatedMatch.completed) {
        updatedCompletedMatches = [...completedMatches, updatedMatch];
      }
    } else {
      // Check if the match is in completed matches
      const completedIndex = completedMatches.findIndex(m => m.id === updatedMatch.id);
      if (completedIndex >= 0) {
        // Update in completed matches
        updatedCompletedMatches[completedIndex] = updatedMatch;
      } else if (updatedMatch.completed) {
        // New completed match
        updatedCompletedMatches = [...completedMatches, updatedMatch];
      } else {
        // New current match
        updatedCurrentMatches = [...currentMatches, updatedMatch];
      }
    }
    
    setCurrentMatches(updatedCurrentMatches);
    setCompletedMatches(updatedCompletedMatches);
    
    // Also update the selected event
    if (selectedEvent) {
      setSelectedEvent({
        ...selectedEvent,
        matches: updatedCurrentMatches,
        completedMatches: updatedCompletedMatches
      });
    }
  };
  
  const handleEventSelect = (event: Event) => {
    setFormat(event.format);
    saveFormat(event.format);
    setPlayers(event.players || []);
    setCurrentMatches(event.matches || []);
    setCompletedMatches(event.completedMatches || []);
    
    setSelectedEvent(event);
    setActiveView('create');
    
    toast.success(`Evento "${event.name}" carregado com sucesso!`);
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
        
        {!format ? (
          // Mostrar busca de eventos na página inicial quando nenhum formato está selecionado
          <EventManager
            format={null as any}
            currentState={{
              players: [],
              teams: [],
              matches: [],
              completedMatches: [],
              currentRound: 1
            }}
            onEventSelect={handleEventSelect}
          />
        ) : (
          <>
            {/* Opções de Visualização - Criar ou Visualizar Evento */}
            <div className="flex justify-between items-center mt-6 mb-4">
              <div className="flex space-x-2">
                <button 
                  onClick={() => setActiveView('create')}
                  className={`px-4 py-2 rounded-md ${
                    activeView === 'create' 
                      ? 'bg-beach-blue text-white' 
                      : 'bg-white text-beach-darkGray'
                  }`}
                >
                  Gerenciar Evento
                </button>
                <button 
                  onClick={() => setActiveView('view')}
                  className={`px-4 py-2 rounded-md ${
                    activeView === 'view' 
                      ? 'bg-beach-blue text-white' 
                      : 'bg-white text-beach-darkGray'
                  }`}
                >
                  Visualizar Eventos
                </button>
              </div>
              
              {selectedEvent && (
                <div className="text-sm font-medium flex items-center gap-2">
                  <span>Evento atual: {selectedEvent.name}</span>
                  {selectedEvent.code && (
                    <span className="bg-beach-blue/10 text-beach-blue px-2 py-1 rounded">
                      Código: {selectedEvent.code}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {activeView === 'view' ? (
              // Exibe o gerenciador de eventos para buscar e selecionar eventos
              <EventManager
                format={format}
                currentState={{
                  players,
                  teams: [],
                  matches: currentMatches,
                  completedMatches,
                  currentRound: 1
                }}
                onEventSelect={handleEventSelect}
              />
            ) : (
              // Exibe o fluxo normal de criação/gerenciamento de evento
              <>
                {/* Gerenciamento de Jogadores */}
                <PlayerManagement 
                  players={players} 
                  setPlayers={setPlayers} 
                  format={format} 
                />
                
                {/* Critérios de Classificação */}
                <SortingCriteriaSelector onCriteriaChange={setSortingCriteria} />
                
                {/* Interface Principal do Torneio */}
                <Tabs defaultValue="matches" className="mt-6">
                  <TabsList className="w-full bg-white">
                    <TabsTrigger value="matches" className="flex-1">Partidas</TabsTrigger>
                    <TabsTrigger value="standings" className="flex-1">Classificação</TabsTrigger>
                    <TabsTrigger value="history" className="flex-1">Histórico</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="matches" className="mt-4">
                    {/* Sistema de Sorteio de Partidas */}
                    <MatchDrawingSystem 
                      players={players}
                      pastMatches={completedMatches}
                      currentMatches={currentMatches}
                      onMatchesGenerated={handleMatchesGenerated}
                      onMatchUpdate={handleMatchUpdate}
                    />
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
                </Tabs>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
