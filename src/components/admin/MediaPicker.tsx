'use client';

import React from 'react';
import MediaExplorerDialog from './MediaExplorerDialog';
import { MediaItem } from './MediaGridItems';

interface Props {
  onSelect?: (url: string, item?: MediaItem) => void;
  onSelectMultiple?: (urls: string[], items?: MediaItem[]) => void;
  allowMultiple?: boolean;
  onClose: () => void;
  filter?: 'image' | 'video' | 'all';
  currentUrl?: string | null;
  initialUrl?: string | null;
  initialFolderId?: string | null;
}

export default function MediaPicker({ 
  onSelect, 
  onSelectMultiple,
  allowMultiple = false,
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
      allowMultiple={allowMultiple}
      currentUrl={currentUrl || initialUrl}
      initialFolderId={initialFolderId}
      onClose={onClose}
      onSelect={onSelect}
      onSelectMultiple={onSelectMultiple}
    />
  );
}
