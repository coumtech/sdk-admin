"use client"
import Image from "next/image";
import React, { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { filesize } from "filesize";
import dropGames from "@/app/assets/images/dropGames.svg";
import plusicon from "@/app/assets/images/plusicon.svg";
import search from "@/app/assets/images/search.svg";
import filter from "@/app/assets/images/filter.svg";
import selectArrow from "@/app/assets/images/selectArrow.svg";
import Tabs from "@/app/components/UI/Tabs";
import gameService from '@/services/gameService';
import BatchUploadWithMetadataModal from "./Modal/BatchUploadWithMetadataModal";
import Table from "@/app/components/UI/Table";
import DateFormatter from "@/app/components/UI/DateFormatter";
import { useRouter } from 'next/navigation';
import adminService from "@/services/adminService";

export interface Game {
  id: string;
  title: string;
  developer: string;
  description: string;
  genre: string;
  gameUrl: string;
  coverUrl: string;
  createdAt: string;
  updatedAt: string;
  metadata: {
    fileSize: number;
    coverSize: number;
  };
}

interface TableRow extends Game { }

interface Column {
  field?: keyof TableRow;
  headerName: string;
  renderCell?: (row: TableRow) => React.ReactNode;
}

const tabs = [
  { label: 'All Games', value: 'Games' },
];

const storageUsageSample = {
  games: { used: 0, color: "bg-blue-500", label: "Games" },
  covers: { used: 0, color: "bg-teal-500", label: "Covers" },
};

export default function GamesList() {
  const [currentTab, setCurrentTab] = useState('Games');
  const [openGameModal, setOpenGameModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [games, setGames] = useState<Game[]>([]);
  const [storageUsage, setStorageUsage] = useState(storageUsageSample);
  const router = useRouter();
  let searchResultTimeOut: NodeJS.Timeout | null = null;

  const columns = [
    {
      field: 'coverUrl',
      headerName: 'Game Image',
      renderCell: (row: TableRow) => (
        <Image src={row.coverUrl} alt="cover" width={50} height={50} />
      ),
    },
    { field: 'title', headerName: 'Game Title' },
    { field: 'developer', headerName: 'Developer' },
    { field: 'genre', headerName: 'Genre' },
    {
      headerName: 'Action',
      renderCell: (row: TableRow) => (
        <button className="game-view-button"
          onClick={() => { handleView('games', row.id) }}
        >
          <span className="px-2">
            View
          </span>
        </button>
      )
    },
    {
      headerName: '',
      renderCell: (row: TableRow) => (
        <button onClick={() => handleGameDelete(row.id)} >Delete</button>
      ),
    },
  ];

  useEffect(() => {
    getGames();
  }, [searchQuery]);

  const getGames = async () => {
    try {
      getStorageBreakdown();
      const res = await gameService.getAllGames({ search: searchQuery });
      setGames(res.games);
    } catch (error) {
      console.log(error);
    }
  };

  const handleGameDelete = async (id: string) => {
    try {
      if (confirm("Are you sure you want to delete this game?")) {
        await gameService.removeGameById(id);
        getGames();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getStorageBreakdown = async () => {
    try {
      const res = await adminService.getTotalStorageBreakdown();
      setStorageUsage((prevUsage) => ({
        ...prevUsage,
        games: { ...prevUsage.games, used: res.totalGameSize },
        covers: { ...prevUsage.covers, used: res.totalCoverSize },
      }));
    } catch (error) {
      console.log(error);
    }
  };

  const exportGames = () => {
    const csv = Papa.unparse(games.map(({ id, title, developer, genre, createdAt }) => ({
      id,
      title,
      developer,
      genre,
      createdAt
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'games.csv');
  };

  const handleView = (path: string, id: string) => {
    router.push(`/admin/${path}/${id}`);
  };

  const handleSearchGame = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (searchResultTimeOut) {
      clearTimeout(searchResultTimeOut);
    }
    searchResultTimeOut = setTimeout(() => {
      setSearchQuery(event.target.value);
    }, 500);
  };

  const totalUsedSpace = Object.values(storageUsage).reduce((acc, item) => acc + (item.used || 0), 0);
  const getPercentage = (usedSpace: number): number => {
    return totalUsedSpace === 0 ? 0 : ((usedSpace || 0) / totalUsedSpace) * 100;
  };

  return (
    <>
      <div className="w-full px-4 card-tile">
        <h2 className="flex justify-between text-lg font-bold mb-4 text-gray-100">
          <span>Storage Usage</span>
          <span>{filesize(totalUsedSpace)}</span>
        </h2>
        <div className="relative w-full h-6 bg-[#333] rounded-full overflow-hidden">
          {Object.entries(storageUsage).map(([key, { used, color }], index) => (
            <div
              key={key}
              className={`absolute top-0 left-0 h-full duration-1000 ${color}`}
              style={{
                width: `${getPercentage(used)}%`,
                marginLeft: `${Object.values(storageUsage)
                  .slice(0, index)
                  .reduce((acc, item) => acc + getPercentage(item.used), 0)}%`,
              }}
            ></div>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          {Object.entries(storageUsage).map(([key, { label, color, used }]) => (
            <div key={key} className="flex items-center">
              <span className={`inline-block w-4 h-4 ${color} rounded-full mr-2`}></span>
              <span className="text-gray-300">{label}: {filesize(used || 0)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 pb-0 transition-all duration-300 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1">
          <div className="flex justify-between items-center">
            <span>Library</span>
            <span className="flex-shrink-0 ml-4">
              <Image className="mr-7" src={filter} alt="Filter" />
            </span>
          </div>
        </div>

        <div className="mb-5">
          <Tabs items={tabs} onSelect={(item) => setCurrentTab(item.value)} value={currentTab} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="mb-0 px-0 border-0">
            <div className="flex items-center">
              <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <Image src={search} alt="search" />
                </div>
                <input
                  type="text"
                  onInput={handleSearchGame}
                  placeholder="Search by game title, developer, or genre"
                  className="border block w-full p-4 ps-10 rounded-l px-3 py-2 music-email-text"
                  required
                />
              </div>
              <div className="add-music-btn px-5">
                <button className="add-music-plus-btn flex items-center px-3"
                  onClick={() => setOpenGameModal(true)}
                >
                  <Image src={plusicon} alt="plusicon" />
                  <span className="px-2">Add Game</span>
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={exportGames}
            className="add-game-plus-btn flex items-center px-3 ml-auto"
          >
            <Image src={plusicon} alt="plusicon" />
            <span className="px-2 text-black">Export CSV</span>
          </button>
        </div>

        <div className="mt-10 mb-10 card-tile">
          <Table rows={games} columns={columns} itemsPerPage={6} />
        </div>

        {games.length === 0 && (
          <div className="flex items-center justify-center drop-game-icon-content">
            <div className="">
              <div className="mt-3">
                <p className="library-game-text">
                  Your library is empty
                </p>
              </div>
              {/* <div className="mt-5">
                <div className="drop-section-layout mb-5">
                  <label htmlFor="dropzone-file" className="drop-select-game-section">
                    <div className="upload-icon">
                      <Image src={selectArrow} alt="selectArrow" />
                    </div>
                    <h4 className="upload-text">Drag and drop your game files here</h4>
                    <input id="dropzone-file" type="file" className="hidden" />
                  </label>
                </div>
              </div> */}
            </div>
          </div>
        )}
      </div>

      <BatchUploadWithMetadataModal
        open={openGameModal}
        setOpen={setOpenGameModal}
        getGames={getGames}
        onClose={() => {
          setOpenGameModal(false);
        }}
      />
    </>
  );
} 