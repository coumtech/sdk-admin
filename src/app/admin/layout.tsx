import React from 'react';
import PageLayout from './page-layout';
import { PlayerProvider } from '@/contexts/PlayerContext';

export default function Layout({ children }: { children: React.ReactNode }) {

    return <>
        <PlayerProvider>
            <PageLayout>
                {children}
            </PageLayout>
        </PlayerProvider>
    </>;
}
