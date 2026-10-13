const fs = require('fs');
let content = fs.readFileSync('src/components/FiltersPanel.tsx', 'utf8');

const newFilterTypes = `
  const filterTypes: Array<{ type: SourceFilter['type']; label: string }> = [
    { type: 'color_correction', label: 'Color Correction' },
    { type: 'crop', label: 'Crop/Pad' },
    { type: 'mask', label: 'Image Mask/Blend' },
    { type: 'blur', label: 'Blur' },
    { type: 'sharpen', label: 'Sharpen' },
    { type: 'lut', label: 'Apply LUT' },
    { type: 'opacity', label: 'Opacity/Alpha' },
    { type: 'glow', label: 'Glow' },
    { type: 'shadow', label: 'Drop Shadow' },
    { type: 'outline', label: 'Outline' },
    { type: 'noise_reduction', label: 'Noise Reduction' },
    { type: 'perspective', label: 'Perspective (3D)' },
    { type: 'corner_pin', label: 'Corner Pin' },
    { type: 'gain', label: 'Audio: Gain' },
    { type: 'noise_gate', label: 'Audio: Noise Gate' },
    { type: 'noise_suppression', label: 'Audio: Noise Suppression' },
    { type: 'limiter', label: 'Audio: Limiter' },
    { type: 'compressor', label: 'Audio: Compressor' },
    { type: 'expander', label: 'Audio: Expander' },
    { type: 'eq', label: 'Audio: Equalizer (EQ)' },
    { type: 'delay', label: 'Audio: Delay' },
    { type: 'pitch', label: 'Audio: Pitch Shift' },
    { type: 'reverb', label: 'Audio: Reverb' },
    { type: 'auto_gain', label: 'Audio: Auto Gain' }
  ]
`;

content = content.replace(/const filterTypes: Array[\s\S]*?\]/, newFilterTypes.trim());

// We will replace the config parameters block
// From `{activeFilter.type === 'color_correction' && (` to `}` before `</div>` in `filter-settings-editor`

const filterRenderers = `
                {activeFilter.type === 'color_correction' && (
                  <div className="settings-controls-grid">
                    <div className="control-slider-group">
                      <label>Brightness ({activeFilter.settings?.brightness ?? 1.0})</label>
                      <input type="range" min="0.5" max="1.5" step="0.05" value={activeFilter.settings?.brightness ?? 1.0} onChange={e => handleUpdateSetting(activeFilter.id, 'brightness', parseFloat(e.target.value))} />
                    </div>
                    <div className="control-slider-group">
                      <label>Contrast ({activeFilter.settings?.contrast ?? 1.0})</label>
                      <input type="range" min="0.5" max="1.5" step="0.05" value={activeFilter.settings?.contrast ?? 1.0} onChange={e => handleUpdateSetting(activeFilter.id, 'contrast', parseFloat(e.target.value))} />
                    </div>
                    <div className="control-slider-group">
                      <label>Saturation ({activeFilter.settings?.saturation ?? 1.0})</label>
                      <input type="range" min="0.0" max="2.0" step="0.05" value={activeFilter.settings?.saturation ?? 1.0} onChange={e => handleUpdateSetting(activeFilter.id, 'saturation', parseFloat(e.target.value))} />
                    </div>
                    <div className="control-slider-group">
                      <label>Hue Shift ({activeFilter.settings?.hueRotate ?? 0}deg)</label>
                      <input type="range" min="-180" max="180" step="5" value={activeFilter.settings?.hueRotate ?? 0} onChange={e => handleUpdateSetting(activeFilter.id, 'hueRotate', parseInt(e.target.value))} />
                    </div>
                  </div>
                )}
                {activeFilter.type === 'crop' && (
                  <div className="settings-controls-grid">
                    <div className="control-slider-group"><label>Left</label><input type="number" value={activeFilter.settings?.left ?? 0} onChange={e => handleUpdateSetting(activeFilter.id, 'left', parseInt(e.target.value))} /></div>
                    <div className="control-slider-group"><label>Right</label><input type="number" value={activeFilter.settings?.right ?? 0} onChange={e => handleUpdateSetting(activeFilter.id, 'right', parseInt(e.target.value))} /></div>
                    <div className="control-slider-group"><label>Top</label><input type="number" value={activeFilter.settings?.top ?? 0} onChange={e => handleUpdateSetting(activeFilter.id, 'top', parseInt(e.target.value))} /></div>
                    <div className="control-slider-group"><label>Bottom</label><input type="number" value={activeFilter.settings?.bottom ?? 0} onChange={e => handleUpdateSetting(activeFilter.id, 'bottom', parseInt(e.target.value))} /></div>
                  </div>
                )}
                {activeFilter.type === 'blur' && (
                  <div className="settings-controls-grid">
                    <div className="control-slider-group">
                      <label>Blur Radius ({activeFilter.settings?.radius ?? 0}px)</label>
                      <input type="range" min="0" max="100" step="1" value={activeFilter.settings?.radius ?? 0} onChange={e => handleUpdateSetting(activeFilter.id, 'radius', parseInt(e.target.value))} />
                    </div>
                  </div>
                )}
                {activeFilter.type === 'lut' && (
                  <div className="settings-controls-grid">
                    <div className="control-slider-group">
                      <label>LUT File Path</label>
                      <input type="text" value={activeFilter.settings?.lutPath ?? ''} onChange={e => handleUpdateSetting(activeFilter.id, 'lutPath', e.target.value)} />
                    </div>
                    <div className="control-slider-group">
                      <label>Amount ({activeFilter.settings?.amount ?? 1.0})</label>
                      <input type="range" min="0" max="1" step="0.05" value={activeFilter.settings?.amount ?? 1.0} onChange={e => handleUpdateSetting(activeFilter.id, 'amount', parseFloat(e.target.value))} />
                    </div>
                  </div>
                )}
                {activeFilter.type === 'opacity' && (
                  <div className="settings-controls-grid">
                    <div className="control-slider-group">
                      <label>Opacity ({activeFilter.settings?.opacity ?? 1.0})</label>
                      <input type="range" min="0" max="1" step="0.05" value={activeFilter.settings?.opacity ?? 1.0} onChange={e => handleUpdateSetting(activeFilter.id, 'opacity', parseFloat(e.target.value))} />
                    </div>
                  </div>
                )}
                {['gain', 'noise_gate', 'noise_suppression', 'limiter', 'compressor', 'eq', 'reverb', 'delay'].includes(activeFilter.type) && (
                  <div className="settings-controls-grid">
                    <div className="control-slider-group">
                      <label>Intensity / Gain (dB)</label>
                      <input type="range" min="-30" max="30" step="1" value={activeFilter.settings?.intensity ?? 0} onChange={e => handleUpdateSetting(activeFilter.id, 'intensity', parseInt(e.target.value))} />
                    </div>
                  </div>
                )}
`;

const filterContentRegex = /{activeFilter\.type === 'color_correction' && \([\s\S]*?<\/div>\s*<\/div>\s*\)\s*:\s*\(/;

content = content.replace(filterContentRegex, filterRenderers.trim() + '\n              </div>\n            </div>\n          ) : (');

fs.writeFileSync('src/components/FiltersPanel.tsx', content);
console.log('FiltersPanel patched with complete filters set');
