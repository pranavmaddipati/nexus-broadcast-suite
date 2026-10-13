const fs = require('fs')

let app = fs.readFileSync('src/App.tsx', 'utf-8')

// 1. Remove panel-bottom-tools from App.tsx completely.
// Center column now has only monitors (defaultSize 65) and panel-workspace (defaultSize 35).
app = app.replace(
  /<Panel id="panel-workspace" order=\{2\} defaultSize=\{5\} minSize=\{3\}>[\s\S]*?<\/PanelGroup>/,
  `<Panel id="panel-workspace" order={2} defaultSize={35} minSize={20}>
                <WorkspaceContainer />
              </Panel>
            </PanelGroup>`
)

// Also remove the resize handle before panel-bottom-tools if it's lingering
app = app.replace(
  /\{\(isDocked\('scene_library'\)[\s\S]*?resize-center-2[\s\S]*?\n/,
  ''
)

// 2. Change Left Column to use PinnedScenes instead of ProductionSequences
app = app.replace(
  /\{renderDockPanel\('production_sequences'\)\}/,
  '<PinnedScenes />'
)
// Add import for PinnedScenes if not present
if (!app.includes('PinnedScenes')) {
  app = app.replace(
    "import { SceneLibrary } from './components/SceneLibrary'",
    "import { SceneLibrary } from './components/SceneLibrary'\nimport { PinnedScenes } from './components/PinnedScenes'"
  )
}
// Remove production sequences from renderPanelContent switch
app = app.replace(/case 'production_sequences':\s*return <PinnedScenes \/>/, '')

// 3. Right Column Layout (Audio Mixer & Inspector)
// We want properties_panel to be hidden if selectedSourceIds.length === 0. This logic is already inside isDocked maybe?
// Let's modify the right column to ALWAYS show Audio Mixer, and show properties above it if docked.
const rightColumnReplacement = `
            {(isDocked('properties_panel') || isDocked('audio_mixer')) ? <PanelResizeHandle id="resize-main-2" className="panel-resize-handle-v" style={{ width: "10px", height: "100%", flexShrink: 0 }} /> : null}
            <Panel id="right-column" order={3} defaultSize={14} minSize={10} maxSize={35}>
              <PanelGroup direction="vertical" id="right-column-vertical-v2">
                {selectedSourceIds.length > 0 ? (
                  <>
                    <Panel id="panel-properties" order={1} defaultSize={40} minSize={20}>
                      {renderDockPanel('properties_panel')}
                    </Panel>
                    <PanelResizeHandle id="resize-right-1" className="panel-resize-handle-h" style={{ height: "10px", width: "100%", flexShrink: 0 }} />
                  </>
                ) : null}
                <Panel id="panel-audio-mixer" order={2} defaultSize={selectedSourceIds.length > 0 ? 60 : 100} minSize={20}>
                  {renderDockPanel('audio_mixer')}
                </Panel>
              </PanelGroup>
            </Panel>
`
app = app.replace(
  /\{\(isDocked\('properties_panel'\) \|\| isDocked\('audio_mixer'\)\) \? <PanelResizeHandle id="resize-main-2"[\s\S]*?\) : null\}/,
  rightColumnReplacement.trim()
)

fs.writeFileSync('src/App.tsx', app)
console.log('App.tsx patched.')
