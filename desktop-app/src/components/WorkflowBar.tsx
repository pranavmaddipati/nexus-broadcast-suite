import React from 'react';
import { Folder, List, Image as ImageIcon, Grid, Globe, SlidersHorizontal, Cpu, Upload, Settings, Circle, Camera, Radio } from 'lucide-react';
import { useBroadcast } from '../context/NewBroadcastContext';

interface TabButtonProps {
  name: string;
  icon: React.ReactNode;
  isSelected?: boolean;
  onClick?: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ name, icon, isSelected, onClick }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const getColor = (name: string) => {
    switch(name) {
      case 'Media Browser': return { start: '#7A3CFF', end: '#A24DFF', border: '#7A3CFF' };
      case 'Playlist': return { start: '#D93CFF', end: '#FF4DB8', border: '#D93CFF' };
      case 'Graphics': return { start: '#FF4D4D', end: '#FF7A2F', border: '#FF4D4D' };
      case 'Multi View': return { start: '#2ECC71', end: '#45E38A', border: '#2ECC71' };
      case 'Browser': return { start: '#2D8CFF', end: '#38B6FF', border: '#2D8CFF' };
      case 'Switcher': return { start: '#1F6BFF', end: '#29C4FF', border: '#1F6BFF' };
      case 'Macros': return { start: '#6C2BD9', end: '#9B4DFF', border: '#6C2BD9' };
      case 'Output': return { start: '#243B8F', end: '#325CFF', border: '#243B8F' };
      case 'Output Settings': return { start: '#1D2E7A', end: '#2A4DFF', border: '#1D2E7A' };
      case 'Recording':
      case 'Virtual Camera':
      case 'NDI Out':
      default: return { start: '#171A35', end: '#171A35', border: '#2D3260' };
    }
  };
  const colorObj = getColor(name);
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0,0,0';
  };
  const rgbColor = hexToRgb(colorObj.start);

  return (
    <button className="premium-btn" 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
      width: '100%',
      height: '100%',
      padding: '2px 16px',
      background: `linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 30%), linear-gradient(180deg, ${colorObj.start} 0%, ${colorObj.end} 100%)`,
      border: `1px solid ${colorObj.border}`,
      boxShadow: `0 0 12px rgba(${rgbColor},0.25)`,
      boxSizing: 'border-box',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      fontFamily: 'Inter, sans-serif',
      whiteSpace: 'nowrap',
      color: '#FFFFFF',
      fontSize: '10px',
      fontWeight: 600,
      borderRadius: '12px',
      transition: 'all 0.15s ease',
      position: 'relative',
      overflow: 'hidden',
      outline: 'none',
      opacity: 1,
      filter: isHovered ? 'brightness(1.15)' : 'none'
    }}>
      <div style={{ color: '#FFFFFF', display: 'flex', alignItems: 'center' }}>
        {icon}
      </div>
      <span style={{ letterSpacing: '0.05em' }}>{name}</span>
    </button>
  );
};

interface WorkflowBarProps {
  onTabClick?: (name: string) => void;
}

export const WorkflowBar: React.FC<WorkflowBarProps> = ({ onTabClick }) => {
  return (
    <div style={{ display: 'flex', gap: '8px', height: '100%', flexShrink: 0, overflow: 'hidden', padding: '0 4px', width: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', height: '100%', gap: '8px', width: '100%' }}>
        {[
          { name: 'Media Browser', icon: <Folder size={18} /> },
          { name: 'Playlist', icon: <List size={18} /> },
          { name: 'Graphics', icon: <ImageIcon size={18} /> },
          { name: 'Multi View', icon: <Grid size={18} /> },
          { name: 'Browser', icon: <Globe size={18} /> },
          { name: 'Switcher', icon: <SlidersHorizontal size={18} /> },
          { name: 'Macros', icon: <Cpu size={18} /> },
          { name: 'Output', icon: <Upload size={18} /> },
          { name: 'Output Settings', icon: <Settings size={18} /> },
          { name: 'Recording', icon: <Circle size={18} /> },
          { name: 'Virtual Camera', icon: <Camera size={18} /> },
          { name: 'NDI Out', icon: <Radio size={18} /> }
        ].map((btn) => (
          <div key={btn.name} style={{ width: '100%', height: '100%' }}>
            <TabButton {...btn} isSelected={btn.name === 'Switcher'} onClick={() => onTabClick && onTabClick(btn.name)} />
          </div>
        ))}
      </div>
    </div>
  )
}
