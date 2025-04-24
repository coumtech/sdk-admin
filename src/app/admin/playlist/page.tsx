"use client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import searchIcon from "@/app/assets/images/search.svg";
import imagePlaylist from "@/app/assets/images/imagePlaylist.png";

import addIcon from "@/app/assets/images/Frameadd.svg";
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { format } from "date-fns";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import PlaylistService from "@/services/playlistService";
import { Playlist } from "@/types/playlist.js";
import Link from "next/link";
import { AppCategory } from "@/types/app";
import AppService from "@/services/appService";
import './styles/model.scss'

const schema = yup.object().shape({
  title: yup.string().required("Playlist Name is required"),
  appCategory: yup.string().required("App category is required"),
  cover: yup
    .mixed()
    .test('required', 'Cover image is required', (value) => {
      return value && (value as FileList).length > 0;
    })
    .test('fileType', 'Cover image must be an image file', (value) => {
      return value && (value as FileList).length > 0 && (value as FileList)[0].type.startsWith('image/');
    }),
});

export default function PlaylistComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [appCategories, setAppCategories] = useState<AppCategory[]>([]);
  const [appCategoriesObject, setAppCategoriesObject] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
    null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<{ title: string; appCategory: string, cover?: any }>({
    resolver: yupResolver(schema),
  });

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = useCallback(async () => {
    try {
      const data = await PlaylistService.getAllPlaylists();
      const formattedPlaylists = data.map((playlist: Playlist) => ({
        ...playlist,
        createdAt: format(new Date(playlist.createdAt || ""), "MMM dd, yyyy"),
      }));
      setPlaylists(formattedPlaylists);
      const categories = await AppService.getAppCategories();
      setAppCategories(categories);
      const result = categories.reduce(
        (acc: { [key: string]: string }, item) => {
          acc[item.code] = item.name;
          return acc;
        },
        {}
      );
      setAppCategoriesObject(result);
    } catch (error) {
      console.error("Error loading playlists:", error);
    }
  }, []);

  const toggleModal = (playlist?: Playlist) => {
    if (playlist) {
      setEditMode(true);
      setSelectedPlaylist(playlist);
      setValue("title", playlist.title);
      setValue("appCategory", playlist.appCategory);
    } else {
      setEditMode(false);
      setSelectedPlaylist(null);
      reset();
    }
    setIsOpen((prev) => !prev);
  };

  const onSubmit: SubmitHandler<{ title: string, appCategory: string, cover?: any }> = async (data) => {
    console.log('data -: ', data)
    try {

      const formData = new FormData();

      formData.append('title', data.title);
      formData.append('appCategory', data.appCategory);

      if (data.cover && data.cover[0]) {
        formData.append('cover', data.cover[0]);
      }

      if (editMode && selectedPlaylist) {
        await PlaylistService.updatePlaylist(selectedPlaylist.id!, formData); // Assuming `updatePlaylist` method exists
      } else {
        await PlaylistService.createPlaylist(formData);
      }
      toggleModal();
      loadPlaylists();
    } catch (error) {
      console.error(
        `Error ${editMode ? "updating" : "creating"} playlist:`,
        error
      );
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredPlaylists = playlists.filter((playlist) =>
    playlist.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="mb-10 pb-10">
      <div className="p-4 transition-all duration-300">
        <div className="w-full mb-4">
          <div className="px-4">
            <h2 className="transaction-text">Playlists</h2>
            <div className="flex items-center justify-between">
              <form className="pt-3">
                <label htmlFor="default-search" className="sr-only">
                  Search
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <Image src={searchIcon} alt="search" />
                  </div>
                  <input
                    type="search"
                    id="default-search"
                    value={searchTerm}
                    onChange={handleSearch}
                    className="block w-full search-bar p-4 ps-10 text-sm text-gray-900 border focus:ring-blue-500 focus:border-blue-500 dark:placeholder-gray-400 dark:text-white"
                    placeholder="Search playlists..."
                    required
                  />
                </div>
              </form>
              <button
                onClick={() => toggleModal()}
                className="mx-3 mt-2 btn-right flex items-center justify-center"
                style={{
                  backgroundColor: "#D9B535",
                  height: "56px",
                  width: "200px",
                }}
              >
                <Image src={addIcon} alt="Add" className="mr-2" />
                <span className="text-black text-lg font-bold">Add New</span>
              </button>
            </div>
          </div>
          {/* Add/Edit Playlist Dialog */}
          <Dialog
            open={isOpen}
            onClose={() => toggleModal()}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
          >
            <DialogPanel className="bg-[#0C0C0C] p-6 w-full max-w-md rounded-lg">
              <DialogTitle className="text-xl font-semibold text-white mb-4">
                {editMode ? "Edit" : "Add New"} Playlist
              </DialogTitle>
              <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Playlist Name
                  </label>
                  <input
                    {...register("title")}
                    className="w-full p-[16px] border border-gray-300 focus:outline-none rounded bg-[#0C0C0C] text-white"
                    type="text"
                    placeholder="Enter playlist name"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.title.message}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Target Apps
                  </label>
                  <select
                    {...register("appCategory")}
                    className="w-full p-[16px] border border-gray-300 focus:outline-none rounded bg-[#0C0C0C] text-white"
                    onChange={(e) => setValue("appCategory", e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select app category
                    </option>
                    {appCategories.map((category) => (
                      <option key={category.code} value={category.code}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Cover</label>
                  <div className="form-group">
                    <input
                      type="file"
                      {...register('cover')}
                      className={`form-control ${errors.cover ? 'is-invalid' : ''}`}
                      accept="image/*"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => toggleModal()}
                    className="px-5 py-2 bg-gray-500 text-white rounded font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-yellow-500 text-black rounded font-semibold"
                  >
                    {editMode ? "Update" : "Save"} Playlist
                  </button>
                </div>
              </form>
            </DialogPanel>
          </Dialog>
        </div>
        {/* Playlists Table */}
        <div className="grid grid-cols-4 lg:grid-cols-4 p-4 gap-4">
          {filteredPlaylists.map((playlist) => (
            <div
              key={playlist.id}
              className="p-3 rounded-lg shadow-lg card-tile"
            >
              <div className="relative">
                {/* Playlist Image */}
                <Link href={`/admin/playlist/${playlist.id}`}>
                  <Image
                    src={playlist.cover ? playlist.cover : imagePlaylist}
                    alt=""
                    className="w-full h-auto rounded-md object-cover"
                    width='200'
                    height='200'
                    style={{ height: '250px' }}
                  />
                </Link>

                <div className="flex justify-between	items-center py-5">
                  {/* Left Side: Playlist Details */}
                    <Link href={`/admin/playlist/${playlist.id}`}>
                      {playlist.title}
                    </Link>

                  {/* Right Side: Edit Menu */}
                  <div className="relative inline-block text-left ml-10">
                    <Menu as="div" className="relative inline-block text-left">
                      <MenuButton className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <EllipsisVerticalIcon className="h-5 w-5 text-gray-500" />
                      </MenuButton>
                      <MenuItems className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                        <MenuItem>
                          {({ focus }) => (
                            <button
                              onClick={() => toggleModal(playlist)}
                              className={`${focus ? "bg-gray-100" : ""
                                } block px-4 py-2 text-sm text-gray-700 w-full text-left rounded-md`}
                            >
                              Edit
                            </button>
                          )}
                        </MenuItem>
                      </MenuItems>
                    </Menu>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
