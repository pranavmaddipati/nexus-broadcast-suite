const fs = require('fs')

function replaceInFile(file, regex, replacement) {
  let content = fs.readFileSync(file, 'utf-8')
  content = content.replace(regex, replacement)
  fs.writeFileSync(file, content)
}

replaceInFile('src/engine/SceneRenderer.ts', /renderSources/g, 'sortedSources')
replaceInFile('src/components/PreviewMonitor.tsx', /renderSources/g, 'sortedSources')

console.log('Renamed renderSources to sortedSources globally')
