export interface Artist {
    id: number;
    name: string;
    bio: string;
    portfolioUrl: string;
    socialMediaLinks: {
        [platform: string]: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
