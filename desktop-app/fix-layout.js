const fs = require('fs');

// 1. Fix App.css
let css = fs.readFileSync('src/App.css', 'utf8');

// Replace .app
css = css.replace(/\.app\s*\{[\s\S]*?\}/, '.app {\n  display: flex;\n  flex-direction: column;\n  width: 100%;\n  height: 100%;\n  min-width: 0;\n  min-height: 0;\n  box-sizing: border-box;\n  background: var(--bg-board);\n  overflow: hidden;\n}');

// Replace .nexus-workspace-grid-container
css = css.replace(/\.nexus-workspace-grid-container\s*\{[\s\S]*?\}/g, '.nexus-workspace-grid-container {\n  flex: 1;\n  width: 100%;\n  height: 100%;\n  min-width: 0;\n  min-height: 0;\n  box-sizing: border-box;\n  margin: 0;\n  padding: 0;\n  display: flex;\n  position: relative;\n  overflow: hidden;\n}');

// Make sure topbar, menubar, statusbar are fixed
css += '\n\n.nexus-topbar, .menu-bar, .status-bar {\n  flex-shrink: 0;\n}\n';

// Force all react-resizable-panels related groups to 100%
css += '\n[data-panel-group] {\n  width: 100% !important;\n  height: 100% !important;\n  min-width: 0 !important;\n  min-height: 0 !important;\n  box-sizing: border-box !important;\n  overflow: hidden !important;\n}\n';
css += '\n[data-panel] {\n  min-width: 0 !important;\n  min-height: 0 !important;\n  box-sizing: border-box !important;\n  overflow: hidden !important;\n}\n';

// Override fixed row heights in App.css for center monitors
css = css.replace(/\.center-monitors-row\s*\{[\s\S]*?\}/, '.center-monitors-row {\n  display: flex;\n  width: 100%;\n  height: 100%;\n  min-width: 0;\n  min-height: 0;\n  box-sizing: border-box;\n  gap: 10px;\n  overflow: hidden;\n}');
css = css.replace(/\.center-matrix-row\s*\{[\s\S]*?\}/, '.center-matrix-row {\n  display: flex;\n  width: 100%;\n  height: 100%;\n  min-width: 0;\n  min-height: 0;\n  box-sizing: border-box;\n  overflow: hidden;\n}');
css = css.replace(/\.center-bottom-panels-row\s*\{[\s\S]*?\}/, '.center-bottom-panels-row {\n  display: flex;\n  width: 100%;\n  height: 100%;\n  min-width: 0;\n  min-height: 0;\n  box-sizing: border-box;\n  overflow: hidden;\n}');
css = css.replace(/\.right-panel-mixer\s*\{[\s\S]*?\}/, '.right-panel-mixer {\n  display: flex;\n  width: 100%;\n  height: 100%;\n  min-width: 0;\n  min-height: 0;\n  box-sizing: border-box;\n  overflow: hidden;\n}');

fs.writeFileSync('src/App.css', css);

// 2. Fix App.tsx Layout & Proportions
let tsx = fs.readFileSync('src/App.tsx', 'utf8');

tsx = tsx.replace(
  /defaultSize=\{14\} minSize=\{10\} maxSize=\{30\}/g,
  'defaultSize={14} minSize={5} maxSize={30}'
);

tsx = tsx.replace(
  /<Panel id="center-column" order=\{2\} defaultSize=\{66\} minSize=\{30\}>/g,
  '<Panel id="center-column" order={2} defaultSize={66} minSize={30}>'
);

tsx = tsx.replace(
  /defaultSize=\{55\} minSize=\{25\}/g,
  'defaultSize={55} minSize={20}'
);

tsx = tsx.replace(
  /defaultSize=\{20\} minSize=\{10\}/g,
  'defaultSize={20} minSize={10}'
);

tsx = tsx.replace(
  /defaultSize=\{25\} minSize=\{15\}/g,
  'defaultSize={25} minSize={15}'
);

tsx = tsx.replace(
  /<Panel id="right-column" order=\{3\} defaultSize=\{20\} minSize=\{15\} maxSize=\{30\}>/g,
  '<Panel id="right-column" order={3} defaultSize={20} minSize={15} maxSize={30}>'
);

// Remove specific grid layout from center monitors, transition uses flex directly
tsx = tsx.replace(
  /<div className="center-monitors-row" style=\{\{ display: 'grid', gridTemplateColumns: '46% 8% 46%', height: '100%', gap: '10px' \}\}>/g,
  '<div className="center-monitors-row" style={{ display: "flex", width: "100%", height: "100%", minWidth: 0, minHeight: 0, boxSizing: "border-box", gap: "10px" }}>'
);

// Wrap preview, transition, program monitors with style to limit flex size
tsx = tsx.replace(
  /<PreviewMonitor \/>/,
  '<div style={{ flex: 1, minWidth: 0, minHeight: 0, boxSizing: "border-box" }}><PreviewMonitor /></div>'
);
tsx = tsx.replace(
  /<TransitionControls \/>/,
  '<div style={{ width: "120px", flexShrink: 0, minHeight: 0, boxSizing: "border-box" }}><TransitionControls /></div>'
);
tsx = tsx.replace(
  /<ProgramMonitor \/>/,
  '<div style={{ flex: 1, minWidth: 0, minHeight: 0, boxSizing: "border-box" }}><ProgramMonitor /></div>'
);

// Inject layout auditor component
const auditorCode = `
const LayoutAuditor = () => {
  useEffect(() => {
    setTimeout(() => {
      console.log('--- LAYOUT AUDIT ---');
      const els = document.querySelectorAll('.app, .app *, [data-panel-group], [data-panel]');
      els.forEach(el => {
        const style = window.getComputedStyle(el);
        if (el.tagName === 'svg' || el.tagName === 'path') return;
        const w = parseFloat(style.width);
        const h = parseFloat(style.height);
        const minW = style.minWidth;
        const minH = style.minHeight;
        
        let parent = el.parentElement;
        if (parent && w > parseFloat(window.getComputedStyle(parent).width) + 2) {
          console.warn('Exceeds width:', el.className || el.tagName, w, 'Parent:', parseFloat(window.getComputedStyle(parent).width));
          el.style.maxWidth = '100%';
          el.style.width = '100%';
          el.style.boxSizing = 'border-box';
        }
        if (parent && h > parseFloat(window.getComputedStyle(parent).height) + 2) {
          console.warn('Exceeds height:', el.className || el.tagName, h, 'Parent:', parseFloat(window.getComputedStyle(parent).height));
          el.style.maxHeight = '100%';
          el.style.height = '100%';
          el.style.boxSizing = 'border-box';
        }
      });
      console.log('--- END AUDIT ---');
    }, 2000);
  }, []);
  return null;
};
`;

tsx = tsx.replace('function WorkspaceShell() {', auditorCode + '\nfunction WorkspaceShell() {');
tsx = tsx.replace('<ShortcutManager />', '<LayoutAuditor />\n      <ShortcutManager />');

// fix minHeight on nexus-workspace-grid-container
tsx = tsx.replace(
  /<div className="nexus-workspace-grid-container" style=\{\{ position: 'relative', flex: 1, minHeight: 0 \}\}>/,
  '<div className="nexus-workspace-grid-container" style={{ position: "relative", flex: 1, width: "100%", height: "100%", minWidth: 0, minHeight: 0, boxSizing: "border-box" }}>'
);

// Ensure all Panel Resize Handles are properly horizontal/vertical
tsx = tsx.replace(/className="panel-resize-handle-h"/g, 'className="panel-resize-handle-h" style={{ height: "10px", width: "100%", flexShrink: 0 }}');
tsx = tsx.replace(/className="panel-resize-handle-v"/g, 'className="panel-resize-handle-v" style={{ width: "10px", height: "100%", flexShrink: 0 }}');

fs.writeFileSync('src/App.tsx', tsx);
console.log('App layout structure patched.');
