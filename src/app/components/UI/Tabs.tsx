"use client"
import React from 'react';
import './styles/tabs.scss';

interface Item { label: string, value: string }

interface TabProps {
    items: Item[];
    className?: string;
    value?: string;
    onSelect?: (item: Item) => void
}

const Tabs: React.FC<TabProps> = ({ items, value, className = '', onSelect = (item) => { } }) => {
    return (
        <div className={`custom-tabs ${className}`}>
            {
                items.map(item =>
                    <span key={item.value} onClick={() => { onSelect(item) }} className={`tab-item ${item.value === value && 'active'}`}>{item.label}</span>
                )
            }
        </div>
    );
};

export default Tabs;