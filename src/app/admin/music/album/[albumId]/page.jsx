"use client"
import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import musicService from '@/services/musicService';
import Image from "next/image";
import DateFormatter from "@/app/components/UI/DateFormatter";
import Table from "@/app/components/UI/Table";
import { format } from "date-fns";
import CustomAudioPlayer from '../../CustomPlayer/CustomAudioPlayer';
import { useRouter } from 'next/navigation';

const AlbumDetail = () => {
  const { albumId } = useParams();
  const mounted = useRef(false);
  const router = useRouter();

  const [albumData, setAlbumData] = useState(null);
  const [audioPlayerValues, setAudioPlayerValues] = useState();

  useEffect(() => {
    if (!mounted.current) {
      getAlbumById();
      mounted.current = true;
    }
  })

  const getAlbumById = () => {
    musicService.getAlbumById(albumId).then((data) => {
      console.log('data -: ', data)
      if (data) {
        setAlbumData(data);
      }
    })
  }

  const columns = [
    {
      field: 'cover',
      headerName: 'Track Image',
      renderCell: (row) => (
        <Image src={row.cover} alt="cover" width={50} height={50} />
      ),
    },
    { field: 'title', headerName: 'Track Title' },
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

  const handleView = (path, id) => {
    router.push(`/${path}/${id}`);
  }

  const handleSongDelete = async (id) => {
    try {
      if (confirm("Are sure to delete?")) {
        await musicService.removeSongById(id)
        getAlbumById();
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleMusicClick = (music) => {
    if (music) {
      console.log('music -: ', music)
      setAudioPlayerValues(music)
    }
  }

  if (!albumData) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <div className="mx-auto p-6 space-y-6">
      <div style={{ backgroundColor: '#141414' }} className="shadow-lg rounded-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <Image
            className="w-full md:w-1/3 object-cover h-full"
            src={albumData.cover}
            alt={`${albumData.title} cover`}
            width='200'
            height='200'
            style={{ width: '250px' }}
          />
          <div className="p-6 flex flex-col">
            <h1 className="text-3xl font-bold text-white mb-4">{albumData.title}</h1>
            <p className="text-gray-500 mb-4"><strong>Release Date:</strong> <DateFormatter date={albumData.releaseDate} /></p>
          </div>
        </div>
      </div>
      <div className="mt-10 mb-10 card-tile">
        <Table rows={albumData.tracks} columns={columns} itemsPerPage={6} actionRowClick={handleMusicClick} />
      </div>
      <div className="last-step-music-section">
          {audioPlayerValues ?
            <div>
              <CustomAudioPlayer audioUrl={audioPlayerValues.audio} title={audioPlayerValues.title} discretion={audioPlayerValues.genre} image={audioPlayerValues.cover} />
            </div>
            : ''}
        </div>
    </div>
  );
};

export default AlbumDetail;
