"use client"
import Image from "next/image";
import React, { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { filesize } from "filesize";
import dropMusic from "@/app/assets/images/dropMusic.png"
import plusicon from "@/app/assets/images/plusicon.svg";
import search from "@/app/assets/images/search.svg";
import filter from "@/app/assets/images/filter.svg";
import selectArrow from "@/app/assets/images/selectArrow.svg";
import Tabs from "@/app/components/UI/Tabs";
import musicService from '@/services/musicService';
// import UploadMusicModel from "./Modal/UploadMusicModel";
import BatchUploadWithMetadataModal from "./Modal/BatchUploadWithMetadataModal";
import AlbumModel from "./Modal/AlbumModel";
import Table from "@/app/components/UI/Table";
import DateFormatter from "@/app/components/UI/DateFormatter";
import { format } from "date-fns";
import { useRouter } from 'next/navigation';
import adminService from "@/services/adminService";
import { usePlayer } from "@/contexts/PlayerContext";

const tabs = [
  { label: 'All Songs', value: 'Music' },
  // { label: 'Albums', value: 'Album' },
]

const storageUsageSample = {
  songs: { used: 0, color: "bg-blue-500", label: "Songs" },
  covers: { used: 0, color: "bg-teal-500", label: "Covers (Song)" },
  albums: { used: 0, color: "bg-cyan-500", label: "Covers (Album)" },
};

export default function Musiclist() {
  const { setPlayer } = usePlayer();
  // const [currentTrack, setCurrentTrack] = useState('')
  const [currentTab, setCurrentTab] = useState('Music');
  const [openMusicModel, setOpenMusicModel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('')
  const [songs, setSongs] = useState([])
  const [albums, setAlbums] = useState([])
  const [openAlbumModel, setOpenAlbumModel] = useState(false)
  const [storageUsage, setStorageUsage] = useState(storageUsageSample)
  const router = useRouter();
  let searchResultTimeOut = null;
  const columns = [
    {
      field: 'coverUrl',
      headerName: 'Track Image',
      renderCell: (row) => (
        <Image src={row.coverUrl} alt="cover" width={50} height={50} />
      ),
    },
    { field: 'title', headerName: 'Track Title' },
    {
      headerName: 'Album Title',
      renderCell: (row) => (
        <>{row.album && row.album.title ? row.album.title : ''}</>
      )
    },
    {
      field: 'duration',
      headerName: 'Duration',
      renderCell: ({ duration }) =>
        format(new Date(0, 0, 0, 0, 0, duration), 'mm:ss'),
    },
    // { field: 'album', headerName: 'Album' },
    // { field: 'release_date', headerName: 'Release Date' },
    { field: 'genre', headerName: 'Genre' },
    // { field: 'listen_count', headerName: 'Listen Count' },
    // { field: 'top_platform', headerName: 'Top Platform' }
    {
      headerName: 'Action',
      renderCell: (row) => (
        <button className="music-view-button"
          onClick={() => { handleView('music', row.id) }}
        >
          <span className="px-2">
            View
          </span>
        </button>
      )
    },
    {
      headerName: '',
      renderCell: (row) => (
        <button onClick={() => handleSongDelete(row.id)} >Delete</button>
      ),
    },
  ];

  const albumColumns = [
    {
      field: 'cover',
      headerName: 'Cover',
      renderCell: (row) => (
        <Image src={row.cover} alt="cover" width={50} height={50} />
      ),
    },
    { field: 'title', headerName: 'Title' },
    {
      field: 'releaseDate',
      headerName: 'Release Date',
      renderCell: (row) => (
        <DateFormatter date={row.releaseDate} />
      ),
    },
    {
      headerName: 'Action',
      renderCell: (row) => (
        <button className="music-view-button"
          onClick={() => { handleView('music/album', row.id) }}
        >
          <span className="px-2">
            View
          </span>
        </button>
      )
    },
    {
      headerName: '',
      renderCell: (row) => (
        <button onClick={() => handleAlbumDelete(row.id)} >Delete</button>
      ),
    },
  ];

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    // getAlbums()
    getSongs()
  }, [searchQuery])

  const getSongs = async () => {
    try {
      getStorageBreakdown()
      const res = await musicService.getAllSongs({ search: searchQuery })
      setSongs(res.songs)
    } catch (error) {
      console.log(error)
    }
  }

  // const getAlbums = async () => {
  //   try {
  //     const res = await musicService.getAlbums({ search: searchQuery })
  //     setAlbums(res.data)
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }

  const handleSongDelete = async (id) => {
    try {
      if (confirm("Are sure to delete?")) {
        await musicService.removeSongById(id)
        getSongs()
      }
    } catch (error) {
      console.log(error)
    }
  }

  // const handleAlbumDelete = async (id) => {
  //   try {
  //     if (confirm("Are sure to delete?")) {
  //       await musicService.removeAlbumById(id)
  //       getAlbums()
  //     }
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }

  const getStorageBreakdown = async () => {
    try {
      const res = await adminService.getTotalStorageBreakdown()
      setStorageUsage((prevUsage) => ({
        ...prevUsage,
        songs: { ...prevUsage.songs, used: res.totalSongSize },
        covers: { ...prevUsage.covers, used: res.totalCoverSize },
        // albums: { ...prevUsage.albums, used: res.albums },
      }));
    } catch (error) {
      console.log(error)
    }
  }

  const exportSongs = () => {
    const csv = Papa.unparse(songs.map(({ id, title, genre, duration, createdAt }) => ({
      id,
      title,
      genre,
      duration,
      createdAt
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'songs.csv');
  }

  // useEffect(() => {
  //   console.log('currentTrack : -', currentTrack)
  // }, [currentTrack])

  const handleMusicClick = (music) => {
    if (music && currentTab === 'Music') {
      setPlayer({
        audioUrl: music.songUrl,
        title: music.title,
        discretion: music.genre,
        image: music.coverUrl,
      })
    }
  }

  const handleView = (path, id) => {
    router.push(`/admin/${path}/${id}`);
  }

  const handleSearchSong = (event) => {
    clearTimeout(searchResultTimeOut);
    searchResultTimeOut = setTimeout(() => {
      console.log(event.target.value)
      setSearchQuery(event.target.value)
    }, 500)
  }

  const totalUsedSpace = Object.values(storageUsage).reduce((acc, item) => acc + item.used, 0);

  const getPercentage = (usedSpace) => (totalUsedSpace === 0 ? 0 : (usedSpace / totalUsedSpace) * 100);

  return (
    <>
      <div className="w-full px-4 card-tile">
        <h2 className="flex justify-between text-lg font-bold mb-4 text-gray-100"><span>Storage Usage</span><span>{filesize(totalUsedSpace)}</span></h2>
        <div className="relative w-full h-6 bg-[#333] rounded-full overflow-hidden">
          {/* Dynamic Progress Bars */}
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
        {/* Dynamic Legend */}
        <div className="mt-4 space-y-2">
          {Object.entries(storageUsage).map(([key, { label, color, used }]) => (
            <div key={key} className="flex items-center">
              <span className={`inline-block w-4 h-4 ${color} rounded-full mr-2`}></span>
              <span className="text-gray-300">{label}: {filesize(used)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={`p-4 pb-0 transition-all duration-300 relative`}>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1">
          <div className="flex justify-between items-center">
            <span>Library</span>
            <span className="flex-shrink-0 ml-4">
              <Image className="mr-7 " src={filter} alt="Music Girl" />
            </span>
          </div>
        </div>
        <div className="mb-5">
          <Tabs items={tabs} onSelect={(item => setCurrentTab(item.value))} value={currentTab} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="mb-0 px-0 border-0">
            <div className="flex items-center">

              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <Image src={search} alt="search" />
                </div>
                <input type="text" onInput={handleSearchSong} placeholder="Search by song, artist, or album." className="border block w-full p-4 ps-10 rounded-l px-3 py-2 music-email-text" required />
              </div>
              {/* <input type="email" placeholder="Search by song, artist, or album." className="border block w-full p-4 ps-10 rounded-l px-3 py-2 music-email-text" required /> */}
              <div className="add-music-btn px-5">
                <button className="add-music-plus-btn flex items-center px-3"
                  onClick={() => { if (currentTab == 'Music') { getSongs(); setOpenMusicModel(!openMusicModel); } else { setOpenAlbumModel(!openAlbumModel); } }}
                >
                  <Image src={plusicon} className="" alt="plusicon" />
                  <span className="px-2">
                    Add {currentTab}
                  </span>
                </button>
              </div>
            </div>
          </div>
          <button onClick={exportSongs} className="add-music-plus-btn flex items-center px-3 ml-auto" >
            <Image src={plusicon} className="" alt="plusicon" />
            <span className="px-2 text-black">
              Export CSV
            </span>
          </button>
        </div>
        <div className="mt-10 mb-10 card-tile">
          {
            currentTab === 'Music'
              ? <Table rows={songs} columns={columns} itemsPerPage={6} actionRowClick={handleMusicClick} />
              : <Table rows={albums} columns={albumColumns} itemsPerPage={6} actionRowClick={handleMusicClick} />
          }
        </div>

        {/* drop section */}
        {
          songs.length == 0 ?
            <div className="flex items-center justify-center drop-music-icon-content">
              <div className="">
                <div className="px-5 ml-4">
                  <Image src={dropMusic} className="music-layout-song-icon" alt="dropMusic" />
                </div>
                <div className="mt-3">
                  <p className="library-musiic-text">
                    Your library is empty
                  </p>
                </div>
                <div className="mt-5">
                  <div className="drop-section-layout mb-5">
                    <label htmlFor="dropzone-file" className="drop-select-music-section">
                      <div className="upload-icon">
                        <Image src={selectArrow} alt="selectArrow"></Image>
                      </div>
                      <h4 className="upload-text">Drag and drop your music files here</h4>
                      <input id="dropzone-file" type="file" className="hidden" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
            : ''
        }
      </div>
      {/* <UploadMusicModel open={openMusicModel} setOpen={setOpenMusicModel} getSongs={getSongs} albums={albums} /> */}
      {/* <AlbumModel open={openAlbumModel} setOpen={setOpenAlbumModel} getAlbums={getAlbums} /> */}
      <BatchUploadWithMetadataModal
        open={openMusicModel}
        setOpen={setOpenMusicModel}
        getSongs={getSongs}
        albums={albums}
        onClose={() => {
          setOpenMusicModel(false);
        }}
      />
    </>
  );
}
