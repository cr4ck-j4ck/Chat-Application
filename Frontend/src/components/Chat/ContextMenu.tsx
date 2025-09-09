// src/components/chat/ContextMenu.tsx
import React, { useEffect, useRef } from 'react';
import { Pin } from 'lucide-react';
import useCommunicationStore from '@/Store/communication.store';

interface ContextMenuProps {
  contextMenu: {
    x: number;
    y: number;
    chatId: string;
    chatType: "group" | "direct";
  } | null;
  setContextMenu: (menu: any) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ contextMenu, setContextMenu }) => {
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const pinConversations  = useCommunicationStore(state => state.pinConversation);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        setContextMenu(null);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setContextMenu]);

  const handlePin = () => {
    if (!contextMenu) return;
    pinConversations(contextMenu.chatId, contextMenu.chatType);
    setContextMenu(null);
  };

  if (!contextMenu) return null;

  return (
    <div
      ref={contextMenuRef}
      style={{
        position: "fixed",
        top: contextMenu.y,
        left: contextMenu.x,
      }}
      className="bg-popover text-popover-foreground shadow-md rounded-md py-1 min-w-[160px] z-50"
    >
      <button
        onClick={handlePin}
        className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
      >
        <Pin className="h-4 w-4" />
        Pin chat
      </button>
    </div>
  );
};

export default ContextMenu;