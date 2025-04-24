export interface Album {
    id: number;
    title: string;
    releaseDate: string;
    userId: number;
    createdAt: string;
    updatedAt: string;
}

export interface TrackAnalysis {
    genre: string;
    tempo: number;
    loudness: number;
    spectral_contrast: number;
    harmonic_content: number;
    dynamic_range: number;
    spectral_flatness: number;
    tempo_stability: number;
    suggestions: string[];
    duration: number;
}

export interface Track {
    id: number;
    title: string;
    genre: string;
    duration: number;
    url: string;
    analysis: TrackAnalysis;
    artistId: number;
    albumId: number;
    createdAt: string;
    updatedAt: string;
}