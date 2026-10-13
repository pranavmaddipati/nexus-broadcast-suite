import React, { useState } from 'react'

import { Plus, Trash2, ArrowUp, ArrowDown, Music } from 'lucide-react'

export const PlaylistPanel: React.FC = () => {
  const [isAdding, setIsAdding] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemType, setNewItemType] = useState('Video')
  
  // Minimal fallback for missing context methods
  const activePlaylist = ''
  const activeList: any[] = []
  
  const moveItem = (index: number, dir: 'up' | 'down') => {}
  const removeMediaFromPlaylist = (playlist: string, id: string) => {}
  const handleAdd = (e: React.FormEvent) => { e.preventDefault(); setIsAdding(false); }

  return (
    <div className="playlist-panel">
      <div className="panel-header">
        <span className="panel-title">PLAYLISTS</span>
        <button onClick={() => setIsAdding(true)}><Plus size={14} /></button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="add-playlist-item-form">
          <input
            type="text"
            placeholder="Item name..."
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            autoFocus
          />
          <div className="form-controls">
            <select
              value={newItemType}
              onChange={(e) => setNewItemType(e.target.value as any)}
            >
              <option value="Video">Video</option>
              <option value="Audio">Audio</option>
              <option value="Image">Image</option>
            </select>
            <div className="form-buttons">
              <button type="submit" className="submit">Add</button>
              <button type="button" className="cancel" onClick={() => setIsAdding(false)}>X</button>
            </div>
          </div>
        </form>
      )}

      <div className="playlist-items-container">
        {(activeList || []).map((item, index) => (
          <div key={item.id} className="playlist-item-row">
            <div className="playlist-item-left">
              <Music size={13} className="text-blue" />
              <div className="playlist-item-details">
                <span className="playlist-item-title">{item.name}</span>
                <span className="playlist-item-type">{item.type}</span>
              </div>
            </div>

            <div className="playlist-item-right">
              <span className="playlist-item-duration">{item.duration}</span>
              <div className="playlist-actions-row">
                <button
                  disabled={index === 0}
                  className="arrow-btn"
                  onClick={() => moveItem(index, 'up')}
                >
                  <ArrowUp size={11} />
                </button>
                <button
                  disabled={index === activeList.length - 1}
                  className="arrow-btn"
                  onClick={() => moveItem(index, 'down')}
                >
                  <ArrowDown size={11} />
                </button>
                <button
                  className="delete-btn"
                  onClick={() => removeMediaFromPlaylist(activePlaylist, item.id)}
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {activeList.length === 0 && (
          <div className="empty-playlist-msg">
            Playlist is empty. Click + to add tracks.
          </div>
        )}
      </div>
    </div>
  )
}
