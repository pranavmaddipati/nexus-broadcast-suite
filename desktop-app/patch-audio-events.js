const fs = require('fs');
let content = fs.readFileSync('src/context/BroadcastContext.tsx', 'utf8');

function inject(funcName, oldStr, newStr) {
    if (content.includes(oldStr)) {
        content = content.replace(oldStr, newStr);
        console.log(`Patched ${funcName}`);
    } else {
        console.log(`Failed to patch ${funcName}`);
    }
}

// setChannelVolume
inject('setChannelVolume',
`  const setChannelVolume = (sourceId: string, vol: number) => {
    setScenes(prev => (prev || []).map(sc => ({
      ...sc,
      sources: (sc.sources || []).map(src => {
        if (src.id !== sourceId) return src
        const updated = { ...src, volume: vol }
        updateWebAudioNode(updated)
        return updated
      })
    })))
  }`,
`  const setChannelVolume = (sourceId: string, vol: number) => {
    try {
      console.log('EVENT: setChannelVolume', { sourceId, vol });
      if (!sourceId) { console.error('setChannelVolume: sourceId is missing'); return; }
      setScenes(prev => {
        let found = false;
        const nextScenes = (prev || []).map(sc => ({
          ...sc,
          sources: (sc.sources || []).map(src => {
            if (src.id !== sourceId) return src
            found = true;
            console.log('State before update:', JSON.parse(JSON.stringify(src)));
            const updated = { ...src, volume: vol }
            console.log('State after update:', JSON.parse(JSON.stringify(updated)));
            updateWebAudioNode(updated)
            return updated
          })
        }));
        if (!found) console.error('setChannelVolume: sourceId not found', sourceId);
        return nextScenes;
      })
    } catch (err: any) {
      console.error('================ REAL EXCEPTION ================');
      console.error('Function: setChannelVolume');
      console.error(err.stack);
      console.error('================================================');
      throw err;
    }
  }`
);

// toggleChannelMute
inject('toggleChannelMute',
`  const toggleChannelMute = (sourceId: string) => {
    setScenes(prev => (prev || []).map(sc => ({
      ...sc,
      sources: (sc.sources || []).map(src => {
        if (src.id !== sourceId) return src
        const updated = { ...src, muted: !src.muted }
        updateWebAudioNode(updated)
        return updated
      })
    })))
  }`,
`  const toggleChannelMute = (sourceId: string) => {
    try {
      console.log('EVENT: toggleChannelMute', { sourceId });
      if (!sourceId) { console.error('toggleChannelMute: sourceId is missing'); return; }
      setScenes(prev => {
        let found = false;
        const nextScenes = (prev || []).map(sc => ({
          ...sc,
          sources: (sc.sources || []).map(src => {
            if (src.id !== sourceId) return src
            found = true;
            console.log('State before update:', JSON.parse(JSON.stringify(src)));
            const updated = { ...src, muted: !src.muted }
            console.log('State after update:', JSON.parse(JSON.stringify(updated)));
            updateWebAudioNode(updated)
            return updated
          })
        }));
        if (!found) console.error('toggleChannelMute: sourceId not found', sourceId);
        return nextScenes;
      })
    } catch (err: any) {
      console.error('================ REAL EXCEPTION ================');
      console.error('Function: toggleChannelMute');
      console.error(err.stack);
      console.error('================================================');
      throw err;
    }
  }`
);

fs.writeFileSync('src/context/BroadcastContext.tsx', content);
