'use client'
import React from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import musicService from '@/services/musicService';
import './styles/model.scss';

interface ModelProps {
    open: boolean;
    setOpen: any;
    getAlbums: any;
}

const schema = yup.object().shape({
    title: yup.string().required('Title is required'),
    releaseDate: yup.string().required('Release date is required'), // Use string for HTML5 date input
    cover: yup.mixed().required('Cover image is required'),
  });

const AlbumModel: React.FC<ModelProps> = ({ open, setOpen, getAlbums }) => {

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
      });

    const onSubmit: SubmitHandler<any> = async (data) => {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('releaseDate', data.releaseDate);
        formData.append('cover', data.cover[0]);

        try {
            await musicService.createAlbum(formData)
            setOpen(false)
            getAlbums();
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
                                        Album
                                    </DialogTitle>
                                    <div className="mt-2">
                                        <div className="max-w-[403px] mx-auto">
                                            <form onSubmit={handleSubmit(onSubmit)}>
                                                {/* Title Field */}
                                                <div className="form-group">
                                                    <label>Title</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter title"
                                                        className="form-control"
                                                        {...register('title')}
                                                    />
                                                    {errors.title && <p className="error-message">{errors.title.message}</p>}
                                                </div>

                                                {/* Release Date Field */}
                                                <div className="form-group">
                                                    <label>Release Date</label>
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        {...register('releaseDate')}
                                                    />
                                                    {errors.releaseDate && <p className="error-message">{errors.releaseDate.message}</p>}
                                                </div>

                                                {/* Cover File Input */}
                                                <div className="form-group">
                                                    <label>Cover</label>
                                                    <input
                                                        type="file"
                                                        className="form-control"
                                                        accept="image/*"
                                                        {...register('cover')}
                                                    />
                                                    {errors.cover && <p className="error-message">{errors.cover.message}</p>}
                                                </div>

                                                {/* Submit Button */}
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

export default AlbumModel;
