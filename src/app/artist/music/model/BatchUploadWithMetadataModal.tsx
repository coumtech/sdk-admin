'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    useFloating,
    useInteractions,
    useClick,
    useDismiss,
    useRole,
    useListNavigation,
    FloatingFocusManager,
    offset,
    flip,
    shift,
} from '@floating-ui/react';
import * as yup from 'yup';
import '../../../admin/music/Modal/styles/model.scss';
import musicService from '@/services/musicService';
import CreatableSelect from 'react-select/creatable';

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
    isrc: yup.string().matches(/^[A-Z]{2}[A-Z0-9]{3}[0-9]{7}$/, 'Invalid ISRC format'),
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
    onClose,
}) => {
    // const [openPicker, authResponse] = useDrivePicker();
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [currentFileIndex, setCurrentFileIndex] = useState(0);
    const [artists, setArtists] = useState<any[]>([]);
    const [googleDriveFiles, setGoogleDriveFiles] = useState<any[]>([]);
    const [isrcOptions, setIsrcOptions] = useState<string[]>([]);
    const [isLoadingIsrc, setIsLoadingIsrc] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const listRef = useRef<Array<HTMLElement | null>>([]);

    const { refs, floatingStyles, context } = useFloating({
        open: isOpen,
        onOpenChange: setIsOpen,
        middleware: [offset(5), flip(), shift()],
        placement: 'bottom-start',
    });

    const click = useClick(context);
    const dismiss = useDismiss(context);
    const role = useRole(context);
    const listNav = useListNavigation(context, {
        listRef,
        activeIndex,
        onNavigate: setActiveIndex,
        virtual: true,
        loop: true,
    });

    const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
        click,
        dismiss,
        role,
        listNav,
    ]);

    const {
        register,
        handleSubmit,
        setValue,
        setError,
        formState: { errors },
        watch,
        control,
    } = useForm({
        resolver: yupResolver(schema),
    });
    const [query, setQuery] = useState('');


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

    const searchIsrc = async (title: string, artist: string) => {
        if (!title || !artist) return;
        
        setIsLoadingIsrc(true);
        try {
            const response = await musicService.lookupIsrc({
                artistName: artist,
                songTitle: title
            });
            
            if (response && response.data && Array.isArray(response.data)) {
                const isrcs = response.data
                    .map((item: { isrc: string }) => item.isrc)
                    .filter((isrc: string) => isValidIsrc(isrc));

                const uniqueIsrcs = Array.from(new Set<string>(isrcs));
                setIsrcOptions(uniqueIsrcs);
            } else {
                setIsrcOptions([]);
            }
        } catch (error) {
            console.error('Error fetching ISRC suggestions:', error);
            setIsrcOptions([]);
        } finally {
            setIsLoadingIsrc(false);
        }
    };

    useEffect(() => {
        const title = watch('title');
        const artist = watch('artist');
        
        if (title && artist) {
            const timeoutId = setTimeout(() => {
                searchIsrc(title, artist);
            }, 1500);
            
            return () => clearTimeout(timeoutId);
        }
    }, [watch('title'), watch('artist')]);

    const onSubmit: SubmitHandler<any> = async (data) => {
        const formData = new FormData();

        formData.append('title', data.title);
        formData.append('artist', data.artist);
        formData.append('price', data.price);
        formData.append('album', data.album === '0' ? null : data.album);
        formData.append('isrc', data.isrc || '');

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
            await musicService.createArtistSong(formData);
            if (isLast) {
                getSongs()
            }
        } catch (error) {
            console.error('Error uploading song:', error);
        }
    };

    const isValidIsrc = (input: string) => {
        const isrcRegex = /^[A-Z]{2}[A-Z0-9]{3}[0-9]{2}[0-9]{5}$/;
        return isrcRegex.test(input.toUpperCase());
    };

    const formatIsrc = (input: string) => {
        return input.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    };

    const customStyles = {
        control: (base: any, state: any) => ({
            ...base,
            background: '#1a1a1a',
            borderColor: state.isFocused ? '#4a4a4a' : '#2a2a2a',
            boxShadow: state.isFocused ? '0 0 0 1px #4a4a4a' : 'none',
            '&:hover': {
                borderColor: '#4a4a4a'
            }
        }),
        menu: (base: any) => ({
            ...base,
            background: '#1a1a1a',
            zIndex: 9999
        }),
        option: (base: any, state: any) => ({
            ...base,
            backgroundColor: state.isFocused ? '#2a2a2a' : '#1a1a1a',
            color: '#fff',
            '&:hover': {
                backgroundColor: '#2a2a2a'
            }
        }),
        input: (base: any) => ({
            ...base,
            color: '#fff'
        }),
        singleValue: (base: any) => ({
            ...base,
            color: '#fff'
        }),
        menuList: (base: any) => ({
            ...base,
            '::-webkit-scrollbar': {
                width: '8px',
                height: '0px',
            },
            '::-webkit-scrollbar-track': {
                background: '#1a1a1a'
            },
            '::-webkit-scrollbar-thumb': {
                background: '#4a4a4a',
                borderRadius: '4px'
            },
            '::-webkit-scrollbar-thumb:hover': {
                background: '#555'
            }
        })
    };

    const handleIsrcChange = (option: any) => {
        if (option) {
            const value = option.value;
            const formattedValue = formatIsrc(value);
            setValue('isrc', formattedValue);
            // Clear any existing error when a valid option is selected
            if (isValidIsrc(formattedValue)) {
                setError('isrc', { type: 'manual', message: '' });
            }
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

                                            <div className="form-group">
                                                <label>ISRC Code</label>
                                                <CreatableSelect
                                                    options={isrcOptions.map(isrc => ({ value: isrc, label: isrc }))}
                                                    isLoading={isLoadingIsrc}
                                                    onInputChange={(inputValue) => {
                                                        const cleaned = inputValue.replace(/[^A-Z0-9]/gi, '').toUpperCase();
                                                        if (cleaned) {
                                                            setValue('isrc', cleaned);
                                                        }
                                                    }}
                                                    onChange={handleIsrcChange}
                                                    onBlur={() => {
                                                        const currentValue = watch('isrc');
                                                        if (currentValue) {
                                                            const formattedValue = formatIsrc(currentValue);
                                                            if (!isValidIsrc(formattedValue)) {
                                                                setError('isrc', {
                                                                    type: 'manual',
                                                                    message: 'Invalid ISRC format. Must be 12 characters: CCXXXYYNNNNN (e.g., USABC2312345)'
                                                                });
                                                            } else {
                                                                setValue('isrc', formattedValue);
                                                                setError('isrc', { type: 'manual', message: '' });
                                                            }
                                                        }
                                                    }}
                                                    styles={customStyles}
                                                    placeholder="Enter or select ISRC Code (e.g., USABC2312345)"
                                                    isClearable
                                                    isSearchable
                                                    noOptionsMessage={() => "Type to enter ISRC code"}
                                                    loadingMessage={() => "Loading ISRC codes..."}
                                                    formatCreateLabel={(inputValue) => `Use "${inputValue}"`}
                                                    isValidNewOption={(inputValue) => {
                                                        const cleaned = inputValue.replace(/[^A-Z0-9]/gi, '').toUpperCase();
                                                        return cleaned.length > 0;
                                                    }}
                                                    createOptionPosition="first"
                                                    value={watch('isrc') ? { value: watch('isrc'), label: watch('isrc') } : null}
                                                />
                                                {errors.isrc && <p className="invalid-feedback">{errors.isrc?.message}</p>}
                                                {watch('isrc') && isValidIsrc(watch('isrc') || '') && (
                                                    <p className="text-sm text-gray-400 mt-1">
                                                        Valid ISRC: {formatIsrc(watch('isrc') || '')}
                                                    </p>
                                                )}
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