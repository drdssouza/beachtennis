import React from 'react';
import { Trophy } from 'lucide-react';

interface TournamentCompleteMessageProps {
  isVisible: boolean;
}

export function TournamentCompleteMessage({ isVisible }: TournamentCompleteMessageProps) {
  if (!isVisible) return null;
  
  return (
    <div className="bg-amber-100 border border-amber-300 rounded-lg p-4 mb-4 flex items-start gap-3">
      <Trophy className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
      <div>
        <h3 className="font-bold text-amber-800">Torneio Completo!</h3>
        <p className="text-amber-700 text-sm">
          Todas as combinações possíveis de duplas já foram formadas. O torneio foi concluído.
        </p>
      </div>
    </div>
  );
}