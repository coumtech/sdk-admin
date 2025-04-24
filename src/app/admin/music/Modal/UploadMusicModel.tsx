'use client'
import React, { useEffect, useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import SelectInput from '@/app/components/UI/SelectInput';
import musicService from '@/services/musicService';
import artistService from '@/services/artistService';
import { Artist } from '@/types/artist';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import './styles/model.scss';

interface ModelProps {
  open: boolean;
  setOpen: any;
  getSongs: any;
  albums: [];
}

const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
  artist: yup.string().required('Artist selection is required'),
  album: yup.string(),
  price: yup
    .number()
    .transform((value, originalValue) => {
      return originalValue.trim() === '' ? undefined : value;
    })
    .required('Price is required')
    .min(0.01, 'Price must be at least 0.01'),
  cover: yup
    .mixed()
    .test('required', 'Cover image is required', (value) => {
      return value && (value as FileList).length > 0;
    })
    .test('fileType', 'Cover image must be an image file', (value) => {
      return value && (value as FileList).length > 0 && (value as FileList)[0].type.startsWith('image/');
    }),
  audio: yup
    .mixed()
    .test('required', 'Audio file is required', (value) => {
      return value && (value as FileList).length > 0;
    })
    .test('fileType', 'Audio must be a valid audio file', (value) => {
      return value && (value as FileList).length > 0 && (value as FileList)[0].type.startsWith('audio/');
    }),
});

const UploadMusicModel: React.FC<ModelProps> = ({ open, setOpen, getSongs, albums }) => {

  const [artists, setArtists] = useState<Artist[]>([])
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });


  useEffect(() => {
    loadArtists()
  }, [])

  const loadArtists = async () => {
    try {
      const res = await artistService.getArtists()
      setArtists(res)
    } catch (error) {
      console.log(error)
    }
  }

  const onSubmit: SubmitHandler<any> = async (data) => {
    const formData = new FormData();

    formData.append('title', data.title);
    formData.append('artist', data.artist);
    formData.append('price', data.price);
    formData.append('album', data.album == '0' ? null : data.album);

    if (data.cover && data.cover[0]) {
      formData.append('cover', data.cover[0]);
    }

    if (data.audio && data.audio[0]) {
      formData.append('audio', data.audio[0]);
    }

    try {
      await musicService.createSong(formData)
      setOpen(false)
      getSongs();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onClose={setOpen} className="relative z-10">
      <DialogBackdrop
        transition
        style={{ backgroundColor: 'rgba(3, 3, 3, 0.75)' }}
        className="fixed inset-0 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            style={{ backgroundColor: '#101010' }}
            transition
            className="relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="">
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <DialogTitle as="h3" className="text-base font-semibold leading-6 text-center pb-4">
                    Song
                  </DialogTitle>
                  <div className="mt-2">
                    <div className="max-w-[403px] mx-auto">
                      <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">

                        <div className="form-group">
                          <label>Title</label>
                          <input
                            type="text"
                            {...register('title')}
                            placeholder="Enter Name"
                            className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                          />
                          {errors.title && <p className="invalid-feedback">{errors.title?.message}</p>}
                        </div>

                        <div className="form-group">
                          <label>Artist</label>
                          <SelectInput
                            options={artists}
                            labelKey="name"
                            valueKey="id"
                            onChange={(e: any) => setValue('artist', e.target.value)}
                          />
                          {errors.artist && <p className="invalid-feedback">{errors.artist?.message}</p>}
                        </div>

                        <div className="form-group">
                          <label>Album</label>
                            <SelectInput
                              options={[
                                { id: 0, title: 'Empty' },  // Add the "Empty" option here
                                ...albums
                              ]}
                              labelKey="title"
                              valueKey="id"
                              onChange={(e: any) => setValue('album', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                          <label>Price</label>
                          <input
                            type="text"
                            {...register('price')}
                            placeholder="Enter Price"
                            className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                            onKeyPress={(event) => {
                              if (!/^[0-9]*\.?[0-9]*$/.test(event.key)) {
                                event.preventDefault();
                              }
                            }}
                          />
                          {errors.price && <p className="invalid-feedback">{errors.price?.message}</p>}
                        </div>

                        <div className="form-group">
                          <label>Cover</label>
                          <input
                            type="file"
                            {...register('cover')}
                            className={`form-control ${errors.cover ? 'is-invalid' : ''}`}
                            accept="image/*"
                          />
                          {errors.cover && <p className="invalid-feedback">{errors.cover?.message}</p>}
                        </div>

                        <div className="form-group">
                          <label>Audio</label>
                          <input
                            type="file"
                            {...register('audio')}
                            className={`form-control ${errors.audio ? 'is-invalid' : ''}`}
                            accept="audio/*"
                          />
                          {errors.audio && <p className="invalid-feedback">{errors.audio?.message}</p>}
                        </div>

                        <button type="submit" className="btn modal-save-button w-full">
                          Save
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
};

export default UploadMusicModel;
