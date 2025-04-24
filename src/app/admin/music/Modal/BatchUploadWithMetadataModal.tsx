'use client';
import React, { useEffect, useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import artistService from '@/services/artistService';
import adminService from "@/services/adminService";
import * as yup from 'yup';
import './styles/model.scss';

interface BatchUploadWithMetadataProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    getSongs: () => void;
    albums: any[];
    onClose: () => void;
}

const CLIENT_ID = '1010845961431-rgkc6f7vueka90lvdeptf4k1dmo0d3uf.apps.googleusercontent.com'; // Replace with your Client ID
const API_KEY = 'AIzaSyCzafv0MwqlOIr5iStL9VOHV1SV8lAx7_I'; // Replace with your API Key
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

const schema = yup.object().shape({
    title: yup.string().required('Title is required'),
    artist: yup.string().required('Artist is required'),
    album: yup.string(),
    price: yup
        .number()
        .transform((value, originalValue) => (originalValue.trim() === '' ? undefined : value))
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
});

const BatchUploadWithMetadataModal: React.FC<BatchUploadWithMetadataProps> = ({
    open,
    setOpen,
    getSongs,
    albums,
    onClose,
}) => {
    // const [openPicker, authResponse] = useDrivePicker();
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [currentFileIndex, setCurrentFileIndex] = useState(0);
    const [artists, setArtists] = useState<any[]>([]);
    const [googleDriveFiles, setGoogleDriveFiles] = useState<any[]>([]);
    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    useEffect(() => {
        if (open) {
            // fetchArtists();
        }
    }, [open]);

    // const fetchArtists = async () => {
    //     try {
    //         const res = await artistService.getArtists();
    //         setArtists(res);
    //     } catch (error) {
    //         console.error('Error fetching artists:', error);
    //     }
    // };

    const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFiles(Array.from(event.target.files));
            setCurrentFileIndex(0);
        }
    };

    useEffect(() => {
        const loadGapi = () => {
            window.gapi.load('client', async () => {
                try {
                    await window.gapi.client.init({
                        apiKey: API_KEY,
                        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
                    });
                    console.log('GAPI initialized successfully');
                } catch (error) {
                    console.error('Error initializing GAPI:', error);
                }
            });
        };

        if (!window.gapi) {
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = loadGapi;
            document.body.appendChild(script);
        } else {
            loadGapi();
        }
    }, []);

    const authenticateAndFetchFiles = async () => {
        try {
            const tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                callback: (response: any) => {
                    if (response.access_token) {
                        openPicker(response.access_token);
                    } else {
                        console.error('Failed to retrieve access token');
                    }
                },
            });
            tokenClient.requestAccessToken();
        } catch (error) {
            console.error('Error authenticating or fetching Google Drive files:', error);
        }
    };

    const openPicker = (accessToken: string) => {
        window.gapi.load('picker', () => {
            const view = new window.google.picker.DocsView()
                .setMimeTypes('audio/mpeg') 
                .setSelectFolderEnabled(false);

            const picker = new window.google.picker.PickerBuilder()
                .addView(view)
                .setOAuthToken(accessToken)
                .setDeveloperKey(API_KEY)
                .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
                .setCallback((data: any) => pickerCallback(data, accessToken))
                .build();

            picker.setVisible(true);
        });
    };

    const pickerCallback = (data: any, token: string) => {
        if (data.action === window.google.picker.Action.PICKED) {
            const pickedFiles = data.docs.map((file: any) => ({
                id: file.id,
                name: file.name,
                oauthToken: token,
            }));
            setGoogleDriveFiles(pickedFiles);
        } else if (data.action === window.google.picker.Action.CANCEL) {
            console.log('Picker canceled');
        }
    };

    const onSubmit: SubmitHandler<any> = async (data) => {
        const formData = new FormData();

        formData.append('title', data.title);
        formData.append('artist', data.artist);
        formData.append('price', data.price);
        formData.append('album', data.album === '0' ? null : data.album);

        const currentFile =
            currentFileIndex < selectedFiles.length
                ? selectedFiles[currentFileIndex]
                : googleDriveFiles[currentFileIndex - selectedFiles.length];

        if (currentFile instanceof File) {
            formData.append('audio', currentFile);
        } else {
            formData.append('googleDriveFileId', currentFile.id);
            formData.append('oauthToken', currentFile.oauthToken);
        }

        if (data.cover && data.cover[0]) {
            formData.append('cover', data.cover[0]);
        }

        try {
            const isLast = currentFileIndex >= (selectedFiles.length + googleDriveFiles.length - 1);
            if (!isLast) {
                setCurrentFileIndex(currentFileIndex + 1);
                setValue('title', '')
            } else {
                setSelectedFiles([])
                setGoogleDriveFiles([])
                setCurrentFileIndex(0)
                onClose();
            }
            await adminService.createSong(formData);
            if (isLast) {
                getSongs()
            }
        } catch (error) {
            console.error('Error uploading song:', error);
        }
    };

    return (
        <Dialog open={open} onClose={() => setOpen(false)} className="relative z-10">
            <DialogBackdrop
                transition
                style={{ backgroundColor: 'rgba(3, 3, 3, 0.75)' }}
                className="fixed inset-0 bg-opacity-75 transition-opacity"
            />
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <DialogPanel
                        style={{ backgroundColor: '#101010' }}
                        transition
                        className="relative transform overflow-hidden rounded-lg text-left shadow-xl sm:my-8 sm:w-full sm:max-w-lg"
                    >
                        <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                            <div>
                                {selectedFiles.length === 0 && googleDriveFiles.length === 0 ? (
                                    <>
                                        <DialogTitle as="h3" className="text-base font-semibold leading-6 text-center pb-4">
                                            Select Audio Files
                                        </DialogTitle>
                                        <div className="form-group">
                                            <input
                                                type="file"
                                                multiple
                                                accept="audio/*"
                                                className="form-control"
                                                onChange={handleFileSelection}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            className="btn modal-save-button text-black w-full mt-4"
                                            onClick={() => authenticateAndFetchFiles()}
                                        >
                                            Select from Google Drive
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <DialogTitle as="h3" className="text-base font-semibold leading-6 text-center pb-4">
                                            Metadata for File: {selectedFiles[currentFileIndex]?.name ??
                                                googleDriveFiles[currentFileIndex - selectedFiles.length]?.name}
                                        </DialogTitle>
                                        <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
                                            <div className="form-group">
                                                <label>Title</label>
                                                <input
                                                    type="text"
                                                    {...register('title')}
                                                    placeholder="Enter Title"
                                                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                                                />
                                                {errors.title && <p className="invalid-feedback">{errors.title?.message}</p>}
                                            </div>

                                            <div className="form-group">
                                                <label>Artist</label>
                                                <input
                                                    type="text"
                                                    {...register('artist')}
                                                    placeholder="Enter Artist Name"
                                                    className={`form-control ${errors.artist ? 'is-invalid' : ''}`}
                                                />
                                                {errors.artist && <p className="invalid-feedback">{errors.artist?.message}</p>}
                                            </div>

                                            <div className="form-group">
                                                <label>Album</label>
                                                <input
                                                    type="text"
                                                    {...register('album')}
                                                    placeholder="Enter Album Name"
                                                    className={`form-control ${errors.album ? 'is-invalid' : ''}`}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>Price</label>
                                                <input
                                                    type="text"
                                                    {...register('price')}
                                                    placeholder="Enter Price"
                                                    className={`form-control ${errors.price ? 'is-invalid' : ''}`}
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

                                            <button type="submit" className="btn modal-save-button text-black w-full">
                                                {currentFileIndex < selectedFiles.length + googleDriveFiles.length - 1
                                                    ? 'Next'
                                                    : 'Finish'}
                                            </button>
                                        </form>
                                    </>
                                )}
                            </div>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
};

export default BatchUploadWithMetadataModal;