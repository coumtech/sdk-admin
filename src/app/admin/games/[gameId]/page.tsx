"use client"
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import gameService from '@/services/gameService';
import Image from "next/image";
import DateFormatter from "@/app/components/UI/DateFormatter";

interface Game {
  id: string;
  title: string;
  developer: string;
  description: string;
  genre: string;
  price: number;
  gameUrl: string;
  coverUrl: string;
  createdAt: string;
  updatedAt: string;
  metadata: {
    fileSize: number;
    coverSize: number;
  };
}

export default function GameDetail() {
  const { gameId } = useParams();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const data = await gameService.getGameById(gameId as string);
        setGame(data);
      } catch (err) {
        setError('Failed to load game details');
        console.error('Error fetching game:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [gameId]);

  if (loading) {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  if (!game) {
    return <p className="text-center text-gray-500">Game not found</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div style={{ backgroundColor: '#141414' }} className="shadow-lg rounded-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <Image
            className="w-full md:w-1/3 object-cover h-full"
            src={game.coverUrl}
            alt={`${game.title} cover`}
            width={200}
            height={200}
          />
          <div className="p-6 flex flex-col">
            <h1 className="text-3xl font-bold text-white mb-4">{game.title}</h1>
            <p className="text-gray-500 mb-2"><strong>Developer:</strong> {game.developer}</p>
            <p className="text-gray-500 mb-2"><strong>Genre:</strong> {game.genre}</p>
            <p className="text-gray-500 mb-2"><strong>Price:</strong> ${game.price.toFixed(2)}</p>
            <p className="text-gray-500 mb-2"><strong>Created:</strong> <DateFormatter date={game.createdAt} /></p>
            <p className="text-gray-500 mb-2"><strong>Last Updated:</strong> <DateFormatter date={game.updatedAt} /></p>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#141414' }} className="shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-white mb-4">Description</h2>
        <p className="text-gray-500">{game.description}</p>
      </div>

      <div style={{ backgroundColor: '#141414' }} className="shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-white mb-4">Game Details</h2>
        <div className="grid grid-cols-2 gap-4 text-gray-500">
          <p><strong>Game Size:</strong> {game.metadata.fileSize} bytes</p>
          <p><strong>Cover Size:</strong> {game.metadata.coverSize} bytes</p>
          <p><strong>Game URL:</strong> <a href={game.gameUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View Game</a></p>
        </div>
      </div>
    </div>
  );
} 