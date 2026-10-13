const fs = require('fs');

let content = fs.readFileSync('src/components/SourceSettingsModal.tsx', 'utf8');

// 1. Add state vars
const stateVars = `
  const [localCaptureCursor, setLocalCaptureCursor] = useState(true)
  const [localCaptureMethod, setLocalCaptureMethod] = useState('automatic')
  const [localCompatibilityMode, setLocalCompatibilityMode] = useState(false)
  const [localHdr, setLocalHdr] = useState(false)
  const [localGpuCapture, setLocalGpuCapture] = useState(true)
`;

content = content.replace(/const \[localCaptureCursor, setLocalCaptureCursor\] = useState\(true\)/, stateVars.trim());

// 2. Sync inside useEffect
const syncState = `
      setLocalCaptureCursor(source?.settings?.captureCursor !== false)
      setLocalCaptureMethod(source?.settings?.captureMethod || 'automatic')
      setLocalCompatibilityMode(source?.settings?.compatibilityMode || false)
      setLocalHdr(source?.settings?.hdr || false)
      setLocalGpuCapture(source?.settings?.gpuCapture !== false)
`;
content = content.replace(/setLocalCaptureCursor\(source\?\.settings\?\.captureCursor !== false\)/, syncState.trim());

// 3. Save inside handleApply
const handleApplyState = `
      captureCursor: localCaptureCursor,
      captureMethod: localCaptureMethod,
      compatibilityMode: localCompatibilityMode,
      hdr: localHdr,
      gpuCapture: localGpuCapture,
`;
content = content.replace(/captureCursor: localCaptureCursor,/, handleApplyState.trim());

// 4. Update the JSX blocks
const windowCaptureJSX = `
                    {source?.type === 'window_capture' && (
                      <div className="field-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <label>Window Target</label>
                          <button onClick={() => {
                            const electron = (window as any).require ? (window as any).require('electron') : null;
                            if (electron) {
                              electron.ipcRenderer.invoke('get-sources').then((sources: any[]) => setDesktopSourcesList(sources));
                            }
                          }} style={{ background: 'transparent', border: '1px solid var(--border-console)', color: 'var(--text-gray)', fontSize: '9px', padding: '2px 6px', borderRadius: '3px', cursor: 'pointer' }}>Refresh</button>
                        </div>
                        <select value={localScreenId} onChange={e => setLocalScreenId(e.target.value)}>
                          <option value="">Select Window...</option>
                          {(desktopSourcesList || []).filter(s => s.id.startsWith('window:')).map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                        <div className="field-group" style={{ marginTop: '8px' }}>
                          <label>Capture Method</label>
                          <select value={localCaptureMethod} onChange={e => setLocalCaptureMethod(e.target.value)}>
                            <option value="automatic">Automatic</option>
                            <option value="bitblt">BitBlt (Windows 7 and up)</option>
                            <option value="wgc">Windows Graphics Capture (Windows 10 1903 and up)</option>
                          </select>
                        </div>
                        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label className="checkbox-row-custom" style={{ cursor: 'pointer' }}>
                            <input type="checkbox" checked={localCaptureCursor} onChange={e => setLocalCaptureCursor(e.target.checked)} />
                            <span>Capture Cursor</span>
                          </label>
                          <label className="checkbox-row-custom" style={{ cursor: 'pointer' }}>
                            <input type="checkbox" checked={localCompatibilityMode} onChange={e => setLocalCompatibilityMode(e.target.checked)} />
                            <span>Multi-Adapter Compatibility</span>
                          </label>
                        </div>
                      </div>
                    )}
`;

const displayCaptureJSX = `
                    {source?.type === 'display_capture' && (
                      <div className="field-group">
                        <label>Display Target</label>
                        <select value={localScreenId} onChange={e => setLocalScreenId(e.target.value)}>
                          <option value="">Select Monitor...</option>
                          {(desktopSourcesList || []).filter(s => s.id.startsWith('screen:')).map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                        <div className="field-group" style={{ marginTop: '8px' }}>
                          <label>Capture Method</label>
                          <select value={localCaptureMethod} onChange={e => setLocalCaptureMethod(e.target.value)}>
                            <option value="automatic">Automatic</option>
                            <option value="dxgi">DXGI Desktop Duplication</option>
                            <option value="wgc">Windows Graphics Capture</option>
                          </select>
                        </div>
                        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label className="checkbox-row-custom" style={{ cursor: 'pointer' }}>
                            <input type="checkbox" checked={localCaptureCursor} onChange={e => setLocalCaptureCursor(e.target.checked)} />
                            <span>Capture Cursor</span>
                          </label>
                          <label className="checkbox-row-custom" style={{ cursor: 'pointer' }}>
                            <input type="checkbox" checked={localHdr} onChange={e => setLocalHdr(e.target.checked)} />
                            <span>Force SDR / Tone Map HDR</span>
                          </label>
                          <label className="checkbox-row-custom" style={{ cursor: 'pointer' }}>
                            <input type="checkbox" checked={localGpuCapture} onChange={e => setLocalGpuCapture(e.target.checked)} />
                            <span>Hardware (GPU) Capture</span>
                          </label>
                        </div>
                      </div>
                    )}
`;

const windowRegex = /{source\?\.type === 'window_capture' && \([\s\S]*?<span>Capture Cursor<\/span>\s*<\/label>\s*<\/div>\s*<\/div>\s*\)}/;
const displayRegex = /{source\?\.type === 'display_capture' && \([\s\S]*?<span>Capture Cursor<\/span>\s*<\/label>\s*<\/div>\s*<\/div>\s*\)}/;

content = content.replace(windowRegex, windowCaptureJSX.trim());
content = content.replace(displayRegex, displayCaptureJSX.trim());

fs.writeFileSync('src/components/SourceSettingsModal.tsx', content);
console.log("SourceSettingsModal patched.");
