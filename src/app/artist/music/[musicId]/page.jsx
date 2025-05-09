"use client"
import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import musicService from '@/services/musicService';
import Image from "next/image";

const MusicDetail = () => {
  const { musicId } = useParams();
  const mounted = useRef(false);

  const [musicData, setMusicData] = useState(null);

  useEffect(() => {
    if (!mounted.current) {
      musicService.getArtistSongById(musicId).then((data) => {
        console.log('data1 -: ', data)
        if (data) {
          setMusicData(data);
        }
      })
      mounted.current = true;
    }
  })

  if (!musicData) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div style={{ backgroundColor: '#141414' }} className="shadow-lg rounded-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <Image
            className="w-full md:w-1/3 object-cover h-full"
            src={musicData.coverUrl}
            alt={`${musicData.title} cover`}
            width='200'
            height='200'
          />
          <div className="p-6 flex flex-col">
            <h1 className="text-3xl font-bold text-white mb-4">{musicData.title}</h1>
            <p className="text-gray-500 mb-4"><strong>Genre:</strong> {musicData.genre}</p>
            <p className="text-gray-500 mb-4"><strong>Duration:</strong> {musicData.duration} seconds</p>
            {/* <audio controls className="w-full mt-4">
              <source src={musicData.audio} type="audio/mp3" />
              Your browser does not support the audio element.
            </audio> */}
          </div>
        </div>
      </div>

      <div  style={{ backgroundColor: '#141414' }} className="shadow-lg rounded-lg p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-white">Analysis</h2>
        <div className="grid grid-cols-2 gap-4 text-gray-500">
          <p><strong>Tempo:</strong> {musicData.analysis?.tempo.toFixed(2)}</p>
          <p><strong>Loudness:</strong> {musicData.analysis?.loudness.toFixed(2)}</p>
          <p><strong>Spectral Contrast:</strong> {musicData.analysis?.spectral_contrast.toFixed(2)}</p>
          <p><strong>Harmonic Content:</strong> {musicData.analysis?.harmonic_content.toFixed(2)}</p>
          <p><strong>Dynamic Range:</strong> {musicData.analysis?.dynamic_range.toFixed(2)}</p>
          <p><strong>Spectral Flatness:</strong> {musicData.analysis?.spectral_flatness.toFixed(2)}</p>
          <p><strong>Tempo Stability:</strong> {musicData.analysis?.tempo_stability.toFixed(2)}</p>
        </div>
      </div>

      <div  style={{ backgroundColor: '#141414' }} className="shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-white mb-4">Suggestions for Improvement</h2>
        <ul className="list-disc list-inside text-gray-500 space-y-2">
          {musicData.analysis?.suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MusicDetail;
