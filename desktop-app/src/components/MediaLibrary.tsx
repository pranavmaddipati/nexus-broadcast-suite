import React, { useRef } from 'react'
import { FilePlus2, Film, Image, Music } from 'lucide-react'
import { useBroadcast } from '../context/NewBroadcastContext'

const mediaTypes = new Set(['media', 'video', 'audio', 'image'])

export const MediaLibrary: React.FC = () => {
  const { scenes = [], activeScene, addSourceToScene, toggleSourceSelection } = useBroadcast()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const scene = scenes.find((item: any) => item.id === activeScene)
  const media = (scene?.sources || []).filter((source: any) => mediaTypes.has(source.type))

  const importFile = (file?: File) => {
    if (!file || !activeScene) return
    const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('audio/') ? 'audio' : 'media'
    addSourceToScene(activeScene, type, file.name, { blobUrl: URL.createObjectURL(file), fileName: file.name })
  }

  return <div className="media-library-panel">
    <div className="panel-header"><span className="title">MEDIA LIBRARY</span><button className="panel-icon-command" title="Import media" onClick={() => inputRef.current?.click()}><FilePlus2 size={13} /></button></div>
    <input ref={inputRef} type="file" accept="video/*,audio/*,image/*" hidden onChange={event => importFile(event.target.files?.[0])} />
    <div className="media-source-list">{media.map((source: any) => {
      const Icon = source.type === 'audio' ? Music : source.type === 'image' ? Image : Film
      return <button key={source.id} onClick={() => toggleSourceSelection(source.id, false)}><Icon size={13} /><span><strong>{source.name}</strong><small>{source.type}</small></span></button>
    })}</div>
  </div>
}
