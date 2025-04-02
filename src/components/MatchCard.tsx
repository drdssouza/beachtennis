import { useState } from "react";
import { Match } from "../types";
import { Check, Plus, Minus } from "lucide-react";
import { toast } from "sonner";

interface MatchCardProps {
  match: Match;
  onMatchUpdate: (updatedMatch: Match) => void;
}

export function MatchCard({ match, onMatchUpdate }: MatchCardProps) {
  const [score1, setScore1] = useState(match.score1);
  const [score2, setScore2] = useState(match.score2);
  
  const updateScore = (team: 1 | 2, increment: boolean) => {
    if (match.completed) {
      toast.error("Esta partida já foi finalizada!");
      return;
    }
    
    if (team === 1) {
      const newScore = increment ? score1 + 1 : Math.max(0, score1 - 1);
      setScore1(newScore);
    } else {
      const newScore = increment ? score2 + 1 : Math.max(0, score2 - 1);
      setScore2(newScore);
    }
  };
  
  const saveMatch = () => {
    const updatedMatch: Match = {
      ...match,
      score1,
      score2,
      completed: true
    };
    
    onMatchUpdate(updatedMatch);
    toast.success("Partida finalizada com sucesso!");
  };
  
  return (
    <div className="beach-card bg-white shadow-md rounded-xl overflow-hidden">
      <div className="bg-beach-blue text-white p-3 font-semibold text-center">
        Rodada {match.round} - Partida {match.id.slice(0, 4)}
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2 items-center mb-4">
          <div className="col-span-1 text-center">
            <div className="flex flex-col items-center">
              <div className="font-bold mb-1">Equipe 1</div>
              <div className="text-sm">{match.team1[0].name}</div>
              <div className="text-sm">{match.team1[1].name}</div>
            </div>
          </div>
          
          <div className="col-span-1 flex justify-center items-center">
            <div className={`text-2xl font-bold ${match.completed ? (score1 > score2 ? 'text-beach-green' : score1 < score2 ? 'text-beach-red' : 'text-beach-darkGray') : 'text-beach-darkGray'}`}>
              {score1}
            </div>
            <div className="mx-2 text-xl">:</div>
            <div className={`text-2xl font-bold ${match.completed ? (score2 > score1 ? 'text-beach-green' : score2 < score1 ? 'text-beach-red' : 'text-beach-darkGray') : 'text-beach-darkGray'}`}>
              {score2}
            </div>
          </div>
          
          <div className="col-span-1 text-center">
            <div className="flex flex-col items-center">
              <div className="font-bold mb-1">Equipe 2</div>
              <div className="text-sm">{match.team2[0].name}</div>
              <div className="text-sm">{match.team2[1].name}</div>
            </div>
          </div>
        </div>
        
        {!match.completed && (
          <>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="flex flex-col items-center">
                <button 
                  onClick={() => updateScore(1, true)}
                  className="p-2 bg-beach-lightGray rounded-full hover:bg-gray-300 mb-2"
                >
                  <Plus className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => updateScore(1, false)}
                  className="p-2 bg-beach-lightGray rounded-full hover:bg-gray-300"
                >
                  <Minus className="h-5 w-5" />
                </button>
              </div>
              
              <div></div>
              
              <div className="flex flex-col items-center">
                <button 
                  onClick={() => updateScore(2, true)}
                  className="p-2 bg-beach-lightGray rounded-full hover:bg-gray-300 mb-2"
                >
                  <Plus className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => updateScore(2, false)}
                  className="p-2 bg-beach-lightGray rounded-full hover:bg-gray-300"
                >
                  <Minus className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <button 
              onClick={saveMatch}
              className="beach-button-accent w-full flex justify-center items-center gap-2"
            >
              <Check className="h-5 w-5" />
              <span>Finalizar Partida</span>
            </button>
          </>
        )}
        
        {match.completed && (
          <div className="bg-beach-lightGray rounded-lg p-3 text-center">
            {score1 > score2 ? (
              <div className="text-beach-green font-medium">
                Vitória da Equipe 1
              </div>
            ) : score1 < score2 ? (
              <div className="text-beach-green font-medium">
                Vitória da Equipe 2
              </div>
            ) : (
              <div className="text-beach-darkGray font-medium">
                Empate
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
