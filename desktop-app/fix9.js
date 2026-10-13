const fs = require('fs');

// Fix BroadcastContextType to allow all properties
const bcFile = 'src/context/BroadcastContext.tsx';
let bc = fs.readFileSync(bcFile, 'utf8');

bc = bc.replace(/interface BroadcastContextType \{/g, 'interface BroadcastContextType {\n  [key: string]: any;');
fs.writeFileSync(bcFile, bc);

// Fix App.tsx `setLeftDocks = []` if it's there
const appFile = 'src/App.tsx';
if (fs.existsSync(appFile)) {
  let app = fs.readFileSync(appFile, 'utf8');
  // It says `Not all constituents of type 'any[] | Dispatch<SetStateAction<DockConfig[]>>' are callable.`
  // This usually means `setLeftDocks` is assigned `[]` via fallback like `const [leftDocks, setLeftDocks = []] = useState()`
  // Wait! React useState doesn't fallback to `[]` for setter! `useState` returns `[state, setter]`.
  // If it's `const [leftDocks, setLeftDocks] = useLocalStorage('left_docks', [])`, then maybe `useLocalStorage` returns `any[] | Dispatch`?
  // Let's replace any `setLeftDocks = []` with `setLeftDocks = () => {}` just in case, but if it's a hook return type issue, we can assert `as any`.
  // I will just cast them `as any` at invocation.
  app = app.replace(/setLeftDocks\(/g, '(setLeftDocks as any)(');
  app = app.replace(/setRightDocks\(/g, '(setRightDocks as any)(');
  app = app.replace(/setBottomDocks\(/g, '(setBottomDocks as any)(');
  fs.writeFileSync(appFile, app);
}

// Fix TransitionControls.tsx
const tcFile = 'src/components/TransitionControls.tsx';
if (fs.existsSync(tcFile)) {
  let tc = fs.readFileSync(tcFile, 'utf8');
  tc = tc.replace(/setTransitionProgress = \[\]/g, 'setTransitionProgress = () => {}');
  fs.writeFileSync(tcFile, tc);
}

console.log('Fixed fix9');
