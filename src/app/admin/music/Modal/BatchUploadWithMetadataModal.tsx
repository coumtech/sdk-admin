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

interface IsrcOption {
    value: string;
    label: string;
}

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
        reset,
        setError,
        formState: { errors },
        watch,
    } = useForm({
        resolver: yupResolver(schema),
    });
    const [query, setQuery] = useState('');

    const filteredIsrcs = query === ''
        ? isrcOptions
        : isrcOptions.filter((isrc) =>
            isrc.toLowerCase().includes(query.toLowerCase())
          );

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
            // First search for the recording
            const response = await fetch(
                `https://musicbrainz.org/ws/2/recording/?query=recording:"${encodeURIComponent(title)}" AND artist:"${encodeURIComponent(artist)}"&fmt=json`
            );
            const data = await response.json();
            
            if (data.recordings && data.recordings.length > 0) {
                // Get the first recording's ID
                const recordingId = data.recordings[0].id;
                
                // Fetch ISRC codes for this recording
                const isrcResponse = await fetch(
                    `https://musicbrainz.org/ws/2/isrc?recording=${recordingId}&fmt=json`
                );
                const isrcData = await isrcResponse.json();
                
                const isrcs = isrcData.isrcs?.map((item: any) => item.isrc) || [];
                setIsrcOptions(isrcs);
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

    // Add debounced search
    useEffect(() => {
        const title = watch('title');
        const artist = watch('artist');
        
        if (title && artist) {
            const timeoutId = setTimeout(() => {
                searchIsrc(title, artist);
            }, 1000);
            
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
            await adminService.createSong(formData);
            if (isLast) {
                getSongs()
            }
        } catch (error) {
            console.error('Error uploading song:', error);
        }
    };

    const isValidIsrc = (input: string) => {
        // ISRC format: CCXXXYYNNNNN (12 characters)
        // CC: Country code (2 letters, A–Z)
        // XXX: Registrant code (3 alphanumeric)
        // YY: Year of reference (2 digits)
        // NNNNN: Unique designation code (5 digits)
        const isrcRegex = /^[A-Z]{2}[A-Z0-9]{3}[0-9]{2}[0-9]{5}$/;
        return isrcRegex.test(input.toUpperCase());
    };

    const formatIsrc = (input: string) => {
        // Remove any non-alphanumeric characters and convert to uppercase
        return input.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    };

    const handleIsrcChange = (inputValue: string) => {
        // Remove any non-alphanumeric characters and convert to uppercase
        const cleaned = inputValue.replace(/[^A-Z0-9]/gi, '').toUpperCase();
        setValue('isrc', cleaned);
        setIsOpen(true);
    };

    const handleSelect = (value: string) => {
        setValue('isrc', value);
        setIsOpen(false);
    };

    const customStyles = {
        control: (base: any) => ({
            ...base,
            background: '#1a1a1a',
            borderColor: errors.isrc ? '#dc3545' : '#2a2a2a',
            '&:hover': {
                borderColor: errors.isrc ? '#dc3545' : '#3a3a3a'
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
        singleValue: (base: any) => ({
            ...base,
            color: '#fff'
        }),
        input: (base: any) => ({
            ...base,
            color: '#fff',
            '& input': {
                font: 'inherit',
            },
        }),
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
                                                <label className="!flex items-center gap-2">
                                                    ISRC Code
                                                    <div className="relative group">
                                                        <span className="text-gray-400 cursor-help">ⓘ</span>
                                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-gray-800 text-white text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50">
                                                            <p className="font-bold mb-1">ISRC Format:</p>
                                                            <p>CCXXXYYNNNNN (12 characters)</p>
                                                            <ul className="list-disc list-inside mt-1 text-xs">
                                                                <li>CC: Country code (2 letters)</li>
                                                                <li>XXX: Registrant code (3 alphanumeric)</li>
                                                                <li>YY: Year of reference (2 digits)</li>
                                                                <li>NNNNN: Unique designation (5 digits)</li>
                                                            </ul>
                                                            <p className="mt-1 text-xs">Example: USABC2312345</p>
                                                        </div>
                                                    </div>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        {...register('isrc')}
                                                        className={`form-control ${errors.isrc ? 'is-invalid' : ''}`}
                                                        placeholder="Enter ISRC Code (e.g., USABC2312345)"
                                                        onChange={(e) => handleIsrcChange(e.target.value)}
                                                        onBlur={() => {
                                                            const currentValue = watch('isrc');
                                                            if (currentValue) {
                                                                if (!isValidIsrc(currentValue)) {
                                                                    setError('isrc', {
                                                                        type: 'manual',
                                                                        message: 'Invalid ISRC format. Must be 12 characters: CCXXXYYNNNNN (e.g., USABC2312345)'
                                                                    });
                                                                } else {
                                                                    setValue('isrc', formatIsrc(currentValue));
                                                                }
                                                            }
                                                            // Delay closing to allow for selection
                                                            setTimeout(() => setIsOpen(false), 200);
                                                        }}
                                                        ref={refs.setReference}
                                                        {...getReferenceProps()}
                                                    />
                                                    {isLoadingIsrc && (
                                                        <div className="absolute right-2 top-2">
                                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                                                        </div>
                                                    )}
                                                    {isOpen && isrcOptions.length > 0 && (
                                                        <FloatingFocusManager context={context} modal={false}>
                                                            <div
                                                                ref={refs.setFloating}
                                                                style={floatingStyles}
                                                                className="w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto"
                                                                {...getFloatingProps()}
                                                            >
                                                                {isrcOptions.map((isrc, index) => (
                                                                    <div
                                                                        key={isrc}
                                                                        ref={(el) => {
                                                                            listRef.current[index] = el;
                                                                        }}
                                                                        role="option"
                                                                        tabIndex={activeIndex === index ? 0 : -1}
                                                                        aria-selected={activeIndex === index}
                                                                        className={`px-4 py-2 cursor-pointer ${
                                                                            activeIndex === index ? 'bg-gray-700' : 'hover:bg-gray-700'
                                                                        }`}
                                                                        {...getItemProps({
                                                                            onClick: () => handleSelect(isrc),
                                                                        })}
                                                                    >
                                                                        {isrc}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </FloatingFocusManager>
                                                    )}
                                                </div>
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