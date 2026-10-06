'use client';

import React from 'react';
import MediaExplorerDialog from './MediaExplorerDialog';
import { MediaItem } from './MediaGridItems';

interface Props {
  onSelect: (url: string, item?: MediaItem) => void;
  onClose: () => void;
  filter?: 'image' | 'video' | 'all';
  currentUrl?: string | null;
  initialUrl?: string | null;
  initialFolderId?: string | null;
}

export default function MediaPicker({ 
  onSelect, 
  onClose, 
  filter = 'all', 
  currentUrl, 
  initialUrl,
  initialFolderId 
}: Props) {
  return (
    <MediaExplorerDialog 
      mode="pick"
      filter={filter}
      currentUrl={currentUrl || initialUrl}
      initialFolderId={initialFolderId}
      onClose={onClose}
      onSelect={onSelect}
    />
  );
}
