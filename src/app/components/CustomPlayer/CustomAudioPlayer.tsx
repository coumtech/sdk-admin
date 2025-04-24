'use client';
import React from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import './CustomPlayer.scss';
import { usePlayer } from '@/contexts/PlayerContext';

const CustomAudioPlayer: React.FC = () => {
  const { audioUrl, title, discretion, image } = usePlayer();

  if (!audioUrl) return null;

  return (
    <div className="audio-player-container">
      {/* Song Image */}
      <div className="audio-player-image">
        <img src={image} alt={title} />
      </div>

      {/* Song Details */}
      <div className="audio-player-details">
        <h3>{title}</h3>
        <p>{discretion}</p>
      </div>

      {/* Audio Controls */}
      <div className="audio-player-controls">
        <AudioPlayer autoPlay src={audioUrl} />
      </div>
    </div>
  );
};

export default CustomAudioPlayer;