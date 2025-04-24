'use client';
import React, { createContext, useContext, useState } from 'react';

interface PlayerContextType {
  audioUrl: string;
  title: string;
  discretion: string;
  image: string;
  setPlayer: (data: PlayerContextType) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playerData, setPlayerData] = useState<PlayerContextType>({
    audioUrl: '',
    title: '',
    discretion: '',
    image: '',
    setPlayer: () => {},
  });

  const setPlayer = (data: PlayerContextType) => {
    setPlayerData({ ...playerData, ...data });
  };

  return (
    <PlayerContext.Provider value={{ ...playerData, setPlayer }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};