'use client';
import React, { useEffect, useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import './styles/model.scss';
import gameService from '@/services/gameService';

interface BatchUploadWithMetadataProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    getGames: () => void;
    onClose: () => void;
}

const CLIENT_ID = '1010845961431-rgkc6f7vueka90lvdeptf4k1dmo0d3uf.apps.googleusercontent.com';
const API_KEY = 'AIzaSyCzafv0MwqlOIr5iStL9VOHV1SV8lAx7_I';
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

interface FormData {
    title: string;
    developer: string;
    description: string;
    genre: string;
    cover?: FileList;
}

const schema = yup.object().shape({
    title: yup.string().required('Title is required'),
    developer: yup.string().required('Developer is required'),
    description: yup.string().required('Description is required'),
    genre: yup.string().required('Genre is required'),
    cover: yup
        .mixed<FileList>()
        .test('required', 'Cover image is required', (value) => {
            return value && value.length > 0;
        })
        .test('fileType', 'Cover image must be an image file', (value) => {
            return value && value.length > 0 && value[0].type.startsWith('image/');
        })
        .optional(),
});

const BatchUploadWithMetadataModal: React.FC<BatchUploadWithMetadataProps> = ({
    open,
    setOpen,
    getGames,
    onClose,
}) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [currentFileIndex, setCurrentFileIndex] = useState(0);
    const [googleDriveFiles, setGoogleDriveFiles] = useState<any[]>([]);
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
    });

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

    const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFiles(Array.from(event.target.files));
            setCurrentFileIndex(0);
        }
    };

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
                .setMimeTypes('application/zip')
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

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        const formData = new FormData();

        formData.append('title', data.title);
        formData.append('developer', data.developer);
        formData.append('description', data.description);
        formData.append('genre', data.genre);

        const currentFile =
            currentFileIndex < selectedFiles.length
                ? selectedFiles[currentFileIndex]
                : googleDriveFiles[currentFileIndex - selectedFiles.length];

        if (currentFile instanceof File) {
            formData.append('game', currentFile);
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
                setValue('title', '');
                setValue('developer', '');
                setValue('description', '');
                setValue('genre', '');
                setValue('cover', undefined);
            } else {
                setSelectedFiles([]);
                setGoogleDriveFiles([]);
                setCurrentFileIndex(0);
                onClose();
            }
            await gameService.createGame(formData);
            if (isLast) {
                getGames();
            }
        } catch (error) {
            console.error('Error uploading game:', error);
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
                                            Select Game Files
                                        </DialogTitle>
                                        <div className="form-group">
                                            <input
                                                type="file"
                                                multiple
                                                accept=".zip"
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
                                                <label>Developer</label>
                                                <input
                                                    type="text"
                                                    {...register('developer')}
                                                    placeholder="Enter Developer Name"
                                                    className={`form-control ${errors.developer ? 'is-invalid' : ''}`}
                                                />
                                                {errors.developer && <p className="invalid-feedback">{errors.developer?.message}</p>}
                                            </div>

                                            <div className="form-group">
                                                <label>Description</label>
                                                <textarea
                                                    {...register('description')}
                                                    placeholder="Enter Description"
                                                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                                                    rows={4}
                                                />
                                                {errors.description && <p className="invalid-feedback">{errors.description?.message}</p>}
                                            </div>

                                            <div className="form-group">
                                                <label>Genre</label>
                                                <input
                                                    type="text"
                                                    {...register('genre')}
                                                    placeholder="Enter Genre"
                                                    className={`form-control ${errors.genre ? 'is-invalid' : ''}`}
                                                />
                                                {errors.genre && <p className="invalid-feedback">{errors.genre?.message}</p>}
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