"use client";
import { useCallback, useEffect, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import PlaylistService from "@/services/playlistService";
import MusicService from "@/services/musicService";
import { Playlist } from "@/types/playlist";
import { Track } from "@/types/music";
import { useParams } from "next/navigation";
import addIcon from "@/app/assets/images/Frameadd.svg";
import imagePlaylist from "@/app/assets/images/imagePlaylist.png";

import Image from "next/image";

export default function PlaylistSongView() {
  const { playlistId } = useParams<{ playlistId: string }>();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [songs, setSongs] = useState<Track[]>([]);
  const [availableSongs, setAvailableSongs] = useState<Track[]>([]);
  const [isAddSongModalOpen, setIsAddSongModalOpen] = useState(false);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (playlistId) {
      loadPlaylistSongs(Number(playlistId));
    }
  }, [playlistId]);

  const loadPlaylistSongs = useCallback(async (id: number) => {
    try {
      const playlistData = await PlaylistService.getPlaylistById(id);
      setPlaylist(playlistData);

      // const playlistSongs = await PlaylistService.getPlaylistSongs(id);
      const playlistSongs = playlistData.tracks;
      setSongs(playlistSongs);

      // Load all songs available to add to the playlist
      const allSongs = await MusicService.getAllSongs({}); // Assuming this method exists
      setAvailableSongs(
        allSongs.data.filter(
          (song) => !playlistSongs.some((ps) => ps.id === song.id)
        )
      );
    } catch (error) {
      console.error("Error loading playlist songs:", error);
    }
  }, []);

  const handleAddSong = async (songId: number) => {
    if (playlistId) {
      try {
        await PlaylistService.addSongToPlaylist(Number(playlistId), songId);
        loadPlaylistSongs(Number(playlistId));
        setIsAddSongModalOpen(false);
      } catch (error) {
        console.error("Error adding song to playlist:", error);
      }
    }
  };

  const handleRemoveSong = async (songId: number) => {
    if (playlistId) {
      try {
        await PlaylistService.removeSongFromPlaylist(
          Number(playlistId),
          songId
        );
        loadPlaylistSongs(Number(playlistId));
      } catch (error) {
        console.error("Error removing song from playlist:", error);
      }
    }
  };

  const toggleAddSongModal = () => {
    setIsAddSongModalOpen((prev) => !prev);
  };

  return (
    <section className="p-6">
      <div className="card-tile">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start items-center gap-4">
            <Image src={playlist?.cover ?? imagePlaylist} alt="Add" width={300} height={300} className="mr-4" />
            <div className="flex flex-col items-start">
              <h1
                className="text-2xl font-bold"
                style={{ fontSize: "40px", color: "#F4F4F4", fontWeight: "700" }}
              >
                {playlist?.title}
              </h1>
              <span
                className="text-2xl font-bold font-rajdhani"
                style={{ fontSize: "14px", color: "#F4F4F4", fontWeight: "600" }}
              >
                {songs.length} Songs
              </span>
            </div>
            {/* </div> */}
          </div>

          <button
            onClick={toggleAddSongModal}
            className="flex items-center justify-center"
            style={{ backgroundColor: "#D9B535", height: "56px", width: "200px" }}
          >
            <span className="text-black text-lg font-bold">Add Song</span>
          </button>
        </div>
      </div>

      <div className="card-tile mt-10">
        <table className="w-full">
          <thead>
            <tr>
              <th>Title</th>
              <th>Artist</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {songs.map((song: any) => (
              <tr key={song.id}>
                <td>{song.title}</td>
                <td>{song.artist?.name}</td>
                <td>
                  <button onClick={() => handleRemoveSong(song.id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Track Modal */}
      <Dialog
        open={isAddSongModalOpen}
        onClose={toggleAddSongModal}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      >
        <DialogPanel className="bg-[#0C0C0C] p-6 w-full max-w-md rounded-lg">
          <DialogTitle className="text-xl font-semibold text-white mb-4">
            Add Track to Playlist
          </DialogTitle>
          <div className="mb-4">
            <select
              className="w-full p-[16px] border border-gray-300 rounded bg-[#0C0C0C] text-white"
              onChange={(e) => handleAddSong(Number(e.target.value))}
              defaultValue=""
            >
              <option value="" disabled>
                Select a song
              </option>
              {availableSongs.map((song: any) => (
                <option key={song.id} value={song.id}>
                  {song.title} - {song.artist.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end">
            <button
              onClick={toggleAddSongModal}
              className="px-4 py-2 bg-gray-500 text-white rounded-md"
            >
              Cancel
            </button>
          </div>
        </DialogPanel>
      </Dialog>
    </section>
  );
}
