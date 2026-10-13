const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const relative = file => path.relative(root, file).replaceAll('\\', '/');
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const file = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(file) : [file];
});
const files = walk(path.join(root, 'src'));
const configPath = path.join(root, 'tsconfig.app.json');
const config = ts.readConfigFile(configPath, ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
const program = ts.createProgram(parsed.fileNames, parsed.options);
const edges = new Map();
const controls = [];
const emptyFunctions = [];
const packages = new Set();
const sourceText = new Map();
for (const file of files.filter(file => /\.[jt]sx?$/.test(file))) {
  const source = program.getSourceFile(file);
  if (!source) continue;
  sourceText.set(path.normalize(file), source.text);
  const imports = [];
  const visit = node => {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      const specifier = node.moduleSpecifier.text;
      if (specifier.startsWith('.')) {
        const resolved = ts.resolveModuleName(specifier, file, parsed.options, ts.sys).resolvedModule;
        if (resolved) imports.push(path.normalize(resolved.resolvedFileName));
        else if (fs.existsSync(path.resolve(path.dirname(file), specifier))) imports.push(path.resolve(path.dirname(file), specifier));
      } else packages.add(specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0]);
    }
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(source);
      const attrs = node.attributes.properties.filter(ts.isJsxAttribute).map(attr => attr.name.getText(source));
      if (['button', 'select', 'input'].includes(tag) && !attrs.some(attr => ['onClick', 'onChange', 'onInput', 'disabled', 'readOnly', 'type'].includes(attr))) {
        controls.push({ file: relative(file), line: source.getLineAndCharacterOfPosition(node.pos).line + 1, tag });
      }
    }
    if ((ts.isArrowFunction(node) || ts.isFunctionDeclaration(node)) && node.body && ts.isBlock(node.body) && node.body.statements.length === 0) {
      emptyFunctions.push({ file: relative(file), line: source.getLineAndCharacterOfPosition(node.pos).line + 1 });
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  edges.set(path.normalize(file), imports);
}
const reachable = new Set();
const visit = file => {
  if (reachable.has(file)) return;
  reachable.add(file);
  for (const dependency of edges.get(file) || []) visit(dependency);
};
visit(path.join(root, 'src', 'main.tsx'));
const cycles = [];
const cycleKeys = new Set();
const findCycles = (file, stack = [], active = new Set()) => {
  if (active.has(file)) {
    const start = stack.indexOf(file);
    const cycle = [...stack.slice(start), file].map(relative);
    const canonical = cycle.slice(0, -1).sort().join('|');
    if (!cycleKeys.has(canonical)) {
      cycleKeys.add(canonical);
      cycles.push(cycle);
    }
    return;
  }
  active.add(file);
  stack.push(file);
  for (const dependency of edges.get(file) || []) findCycles(dependency, stack, active);
  stack.pop();
  active.delete(file);
};
for (const file of edges.keys()) findCycles(file);

const duplicateGroups = new Map();
for (const file of files) {
  const stat = fs.statSync(file);
  if (!stat.isFile() || stat.size === 0) continue;
  const hash = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  const group = duplicateGroups.get(hash) || [];
  group.push(relative(file));
  duplicateGroups.set(hash, group);
}
const exactDuplicateFiles = [...duplicateGroups.values()].filter(group => group.length > 1);

const assetExtensions = /\.(png|jpe?g|gif|webp|svg|ico|mp3|wav|mp4|mov|webm|woff2?|ttf)$/i;
const codeCorpus = [...sourceText.values()].join('\n');
const unreferencedAssets = files
  .filter(file => assetExtensions.test(file))
  .filter(file => !codeCorpus.includes(path.basename(file)))
  .map(relative)
  .sort();

const rendererIpc = new Set();
for (const text of sourceText.values()) {
  for (const match of text.matchAll(/ipcRenderer\.(?:invoke|send)\(\s*['"]([^'"]+)['"]/g)) rendererIpc.add(match[1]);
}
const mainFile = path.join(root, 'electron', 'main.js');
const mainText = fs.existsSync(mainFile) ? fs.readFileSync(mainFile, 'utf8') : '';
const mainIpc = new Set([...mainText.matchAll(/ipcMain\.(?:handle|on)\(\s*['"]([^'"]+)['"]/g)].map(match => match[1]));
const missingMainIpcHandlers = [...rendererIpc].filter(channel => !mainIpc.has(channel)).sort();
const unusedMainIpcHandlers = [...mainIpc].filter(channel => !rendererIpc.has(channel)).sort();
const diagnostics = ts.getPreEmitDiagnostics(program).map(diagnostic => ({
  file: diagnostic.file ? relative(diagnostic.file.fileName) : null,
  line: diagnostic.file && diagnostic.start !== undefined ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line + 1 : null,
  code: diagnostic.code,
  message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
}));
const report = {
  generatedAt: new Date().toISOString(),
  limitations: 'Static candidates require runtime and dynamic-reference review before deletion. Handler presence does not prove functionality. Asset references in CSS and string paths are not resolved.',
  sourceFiles: files.length,
  reachableFiles: [...reachable].map(relative).sort(),
  unreachableCandidates: files.filter(file => !reachable.has(file)).map(relative).sort(),
  circularImports: cycles,
  exactDuplicateFiles,
  unreferencedAssets,
  ipc: {
    rendererChannels: [...rendererIpc].sort(),
    mainChannels: [...mainIpc].sort(),
    missingMainHandlers: missingMainIpcHandlers,
    unusedMainHandlers: unusedMainIpcHandlers,
  },
  importedPackages: [...packages].sort(),
  controlsWithoutDirectHandlers: controls,
  emptyFunctions,
  diagnostics,
};
const output = path.join(root, 'audit');
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(path.join(output, 'static-audit.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({
  sourceFiles: files.length,
  reachable: reachable.size,
  unreachableCandidates: report.unreachableCandidates.length,
  circularImports: cycles.length,
  duplicateGroups: exactDuplicateFiles.length,
  unreferencedAssets: unreferencedAssets.length,
  missingMainIpcHandlers: missingMainIpcHandlers.length,
  controlsToReview: controls.length,
  emptyFunctions: emptyFunctions.length,
  typeErrors: diagnostics.length,
}, null, 2));
