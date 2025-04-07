import React, { useState, useEffect } from 'react';
import { Event, TournamentFormat } from '../types';
import { Search, Trophy, Calendar, Copy, ArrowRight, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { generateEventCode } from '@/utils/event_utils';

interface EventManagerProps {
  format: TournamentFormat | null;
  currentState: {
    players: any[];
    teams: any[];
    matches: any[];
    completedMatches: any[];
    currentRound: number;
  };
  onEventSelect: (event: Event) => void;
}

// Define a fixed key for localStorage to ensure consistency
const EVENTS_STORAGE_KEY = 'beach-tennis-events';

// Load events from localStorage
const loadEvents = (): Event[] => {
  try {
    const eventsJson = localStorage.getItem(EVENTS_STORAGE_KEY);
    return eventsJson ? JSON.parse(eventsJson) : [];
  } catch (error) {
    console.error('Error loading events:', error);
    return [];
  }
};

// Save events to localStorage
const saveEvents = (events: Event[]) => {
  try {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('Error saving events:', error);
  }
};

export function EventManager({ format, currentState, onEventSelect }: EventManagerProps) {
  const [events, setEvents] = useState<Event[]>(loadEvents());
  const [searchTerm, setSearchTerm] = useState('');
  const [eventCode, setEventCode] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'search'>('grid');
  const [copySuccess, setCopySuccess] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());
  
  // Filter events by search term and format
  const filteredEvents = events.filter(event => {
    if (viewMode === 'search') {
      // When in search mode, only filter by search term (code or name)
      return event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             (event.code && event.code.toLowerCase().includes(searchTerm.toLowerCase()));
    } else {
      // In grid mode, filter by search term and format
      const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (event.code && event.code.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFormat = format ? event.format === format : true;
      return matchesSearch && matchesFormat;
    }
  });
  
  // Find event by code
  const findEventByCode = () => {
    if (!eventCode.trim()) {
      toast.error('Por favor, informe o código do evento');
      return;
    }
    
    // Refresh events from localStorage before searching to ensure we have the latest data
    const freshEvents = loadEvents();
    setEvents(freshEvents);
    
    const foundEvent = freshEvents.find(e => 
      e.code && e.code.toLowerCase() === eventCode.toLowerCase()
    );
    
    if (foundEvent) {
      onEventSelect(foundEvent);
      toast.success(`Evento "${foundEvent.name}" encontrado!`);
    } else {
      toast.error('Evento não encontrado. Verifique o código e tente novamente.');
    }
  };
  
  // Copy event code to clipboard
  const copyEventCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
    toast.success('Código copiado para a área de transferência!');
  };
  
  // Refresh events from localStorage periodically to catch changes from other browsers/tabs
  useEffect(() => {
    // Load events immediately when mounting
    const freshEvents = loadEvents();
    setEvents(freshEvents);
    
    // Set up periodic refresh
    const intervalId = setInterval(() => {
      const freshEvents = loadEvents();
      setLastRefresh(Date.now());
      setEvents(freshEvents);
    }, 2000); // Check every 2 seconds
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Save events to localStorage when they change
  useEffect(() => {
    saveEvents(events);
  }, [events]);
  
  return (
    <div className="beach-card mt-6">
      <h2 className="text-xl font-bold mb-4 text-beach-darkGray flex items-center gap-2">
        <Trophy className="h-5 w-5" />
        Eventos
      </h2>
      
      <Tabs defaultValue="browse" className="mb-6">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="browse" onClick={() => setViewMode('grid')}>Navegar Eventos</TabsTrigger>
          <TabsTrigger value="search" onClick={() => setViewMode('search')}>Localizar Evento</TabsTrigger>
        </TabsList>
        
        <TabsContent value="browse">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => (
                <div 
                  key={event.id}
                  className="bg-white border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-grow" onClick={() => onEventSelect(event)}>
                      <h3 className="font-medium">{event.name}</h3>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(event.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {event.code && (
                        <div className="flex items-center">
                          <span className="bg-beach-blue/10 text-beach-darkGray px-2 py-1 rounded text-xs mr-1">
                            {event.code}
                          </span>
                          <button 
                            onClick={() => copyEventCode(event.code || '')}
                            className="text-gray-500 hover:text-beach-blue"
                            title="Copiar código"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      
                      <div className="text-sm">
                        {event.format === 'super8' && (
                          <span className="bg-beach-blue text-white px-2 py-1 rounded-full text-xs">
                            Super 8
                          </span>
                        )}
                        {event.format === 'super12' && (
                          <span className="bg-beach-orange text-white px-2 py-1 rounded-full text-xs">
                            Super 12
                          </span>
                        )}
                      </div>
                      
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0" 
                        onClick={() => onEventSelect(event)}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'Nenhum evento encontrado' : 'Nenhum evento criado ainda'}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="search">
          <div className="flex flex-col space-y-4">
            <p className="text-sm text-gray-600">
              Digite o código do evento para encontrá-lo rapidamente:
            </p>
            
            <div className="flex space-x-2">
              <Input 
                placeholder="Digite o código do evento (ex: ABC123)" 
                value={eventCode}
                onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                className="flex-grow"
                maxLength={6}
              />
              <Button onClick={findEventByCode}>
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>
            
            <div className="text-sm text-gray-600 mt-2">
              <p className="font-medium mt-4">Para encontrar um evento:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Digite o código exato (6 caracteres) fornecido pelo organizador</li>
                <li>O código é composto por 3 letras e 3 números (exemplo: ABC123)</li>
                <li>Não diferencia maiúsculas de minúsculas</li>
              </ul>
            </div>
            
            <p className="text-xs italic text-gray-500 mt-2">
              Última atualização: {new Date(lastRefresh).toLocaleTimeString()}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
