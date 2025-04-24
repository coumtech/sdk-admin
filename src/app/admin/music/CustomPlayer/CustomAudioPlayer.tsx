'use client'
import React from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import './CustomPlayer.scss'

interface PlayerProps {
  audioUrl: string;
  title: string;
  discretion: string;
  image: any;
}

const CustomAudioPlayer: React.FC<PlayerProps> = ({ audioUrl, title, discretion, image }) => {
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
        <AudioPlayer
          autoPlay
          src={audioUrl}
        />
      </div>
    </div>
  );
};

export default CustomAudioPlayer;
