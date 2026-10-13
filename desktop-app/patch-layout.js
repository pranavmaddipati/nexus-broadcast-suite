const fs = require('fs')
const path = require('path')

const fixFile = (filepath, replacements) => {
  let content = fs.readFileSync(filepath, 'utf8')
  replacements.forEach(({ search, replace }) => {
    content = content.replace(search, replace)
  })
  fs.writeFileSync(filepath, content)
}

// 1. App.tsx
// Adjust global flex layout
fixFile(path.join(__dirname, 'src/App.tsx'), [
  {
    search: /<div className="premium-panel" style={{ flex: '1.5 1 0', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', minWidth: 0 }}>/g,
    replace: '<div className="premium-panel" style={{ flex: \'1.6 1 0\', height: \'100%\', display: \'flex\', flexDirection: \'column\', overflow: \'hidden\', boxSizing: \'border-box\', minWidth: 0 }}>'
  },
  {
    search: /<div style={{ flex: '7.5 1 0', display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0, height: '100%' }}>/g,
    replace: '<div style={{ flex: \'8.4 1 0\', display: \'flex\', flexDirection: \'column\', gap: \'8px\', minWidth: 0, height: \'100%\' }}>'
  },
  {
    search: /<div style={{ flex: '60 1 0', display: 'flex', flexDirection: 'row', gap: '12px', minHeight: 0 }}>/g,
    replace: '<div style={{ flex: \'1.2 1 0\', display: \'flex\', flexDirection: \'row\', gap: \'8px\', minHeight: 0 }}>'
  },
  {
    search: /<div className="premium-panel" style={{ flex: '2.2 1 0'/g,
    replace: '<div className="premium-panel" style={{ flex: \'2.4 1 0\''
  },
  {
    search: /<div className="premium-panel" style={{ flex: '1.0 1 0'/g,
    replace: '<div className="premium-panel" style={{ flex: \'1.0 1 0\''
  },
  {
    search: /<div className="premium-panel" style={{ flex: '2.1 1 0'/g,
    replace: '<div className="premium-panel" style={{ flex: \'2.6 1 0\''
  },
  {
    search: /<div id="workspace-container" style={{ display: 'flex', flexDirection: 'row', height: '100%', width: '100%', overflow: 'hidden', padding: '16px', boxSizing: 'border-box', gap: '12px', background: 'var(--bg-main)' }}>/g,
    replace: '<div id="workspace-container" style={{ display: \'flex\', flexDirection: \'row\', height: \'100%\', width: \'100%\', overflow: \'hidden\', padding: \'8px\', boxSizing: \'border-box\', gap: \'8px\', background: \'var(--bg-main)\' }}>'
  }
])

// 2. WorkspaceContainer.tsx
fixFile(path.join(__dirname, 'src/components/WorkspaceContainer.tsx'), [
  {
    search: /<div id="bottom-workspace" style={{ display: 'grid', gridTemplateColumns: '1.5fr 2.2fr 3.2fr 2.1fr', gap: '12px'/g,
    replace: '<div id="bottom-workspace" style={{ display: \'grid\', gridTemplateColumns: \'2.2fr 2.3fr 2.4fr 1.5fr\', gap: \'8px\''
  },
  {
    search: /<div style={{ flex: '40 1 0'/g,
    replace: '<div style={{ flex: \'1 1 0\''
  }
])

// 3. index.css
fixFile(path.join(__dirname, 'src/index.css'), [
  {
    search: /--panel-padding: 12px;/g,
    replace: '--panel-padding: 8px;'
  },
  {
    search: /--panel-gap: 12px;/g,
    replace: '--panel-gap: 8px;'
  },
  {
    search: /--section-gap: 12px;/g,
    replace: '--section-gap: 8px;'
  }
])

// 4. PreviewMonitor.tsx & ProgramMonitor.tsx
const fixMonitor = (filepath) => {
  fixFile(filepath, [
    {
      search: /height: '40px'/g,
      replace: "height: '32px'"
    },
    {
      search: /height: '28px'/g,
      replace: "height: '24px'"
    },
    {
      search: /gap: '8px'/g,
      replace: "gap: '4px'"
    }
  ])
}
fixMonitor(path.join(__dirname, 'src/components/PreviewMonitor.tsx'))
fixMonitor(path.join(__dirname, 'src/components/ProgramMonitor.tsx'))

// 5. SourcesPanel.tsx
fixFile(path.join(__dirname, 'src/components/SourcesPanel.tsx'), [
  {
    search: /height: '80px'/g,
    replace: "height: '64px'"
  },
  {
    search: /padding: '8px'/g,
    replace: "padding: '4px'"
  }
])

console.log('Layout patched')
