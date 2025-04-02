import { useState } from "react";
import { TournamentFormat } from "../types";

interface FormatSelectorProps {
  onFormatSelect: (format: TournamentFormat) => void;
  selectedFormat: TournamentFormat | null;
}

export function FormatSelector({ onFormatSelect, selectedFormat }: FormatSelectorProps) {
  return (
    <div className="beach-card">
      <h2 className="text-xl font-bold mb-4 text-beach-darkGray">Selecione o Formato</h2>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => onFormatSelect('super8')}
          className={`p-6 rounded-xl border-2 transition-all flex-1 ${
            selectedFormat === 'super8' 
              ? 'border-beach-orange bg-beach-orange/10' 
              : 'border-gray-200 hover:border-beach-orange/50'
          }`}
        >
          <h3 className="font-bold text-lg mb-2">Super 8</h3>
          <p className="text-sm text-gray-600">8 jogadores, 4 duplas por rodada</p>
        </button>
        
        <button
          onClick={() => onFormatSelect('super12')}
          className={`p-6 rounded-xl border-2 transition-all flex-1 ${
            selectedFormat === 'super12' 
              ? 'border-beach-blue bg-beach-blue/10' 
              : 'border-gray-200 hover:border-beach-blue/50'
          }`}
        >
          <h3 className="font-bold text-lg mb-2">Super 12</h3>
          <p className="text-sm text-gray-600">12 jogadores, 6 duplas por rodada</p>
        </button>
      </div>
    </div>
  );
}