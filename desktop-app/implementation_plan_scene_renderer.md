# Scene Rendering Engine Implementation Plan

## Goal
Implement a robust, performant Scene Rendering Engine for the Preview and Program Monitors that renders all sources using a unified `SceneRenderer` component.

## Open Questions
None. The requirements for the renderer props and features are explicitly provided.

## Proposed Changes

### `src/components/SceneRenderer.tsx`
- Refactor the component signature to match `<SceneRenderer scene={scene} editable={boolean} mode="preview|program" />`.
- Pull the `scene` data from props instead of `useBroadcast` context.
- Implement the "No Sources in Scene" empty state if the scene has no visible sources.
- Improve source type handling (especially mapping media sources to HTML tags).
- Ensure `editable` propagates to whether interactable elements (if any) are active, though Transform handles are drawn in `PreviewMonitor`.
- Optimize rendering with `React.memo` to maintain 60FPS.

### `src/components/PreviewMonitor.tsx`
- Update the `<SceneRenderer>` invocation to pass the `scene` object directly: `<SceneRenderer scene={currentScene} editable={true} mode="preview" />`.
- Verify transform handles and multi-selection work seamlessly above the renderer.
- Remove duplicate logic if it overlaps with `SceneRenderer`.

### `src/components/ProgramMonitor.tsx`
- Update the `<TransitionEngine>` to pass the `scene` object to `<SceneRenderer>`.
- In `TransitionEngine`, pass `editable={false}` and `mode="program"`.
- Ensure it respects live state cleanly without unnecessary rerenders.

### `src/components/TransitionEngine.tsx`
- Update inner `<SceneRenderer>` invocations to match the new props.

## Verification Plan
1. Launch `npm run dev`.
2. Add multiple sources to a scene.
3. Verify they render correctly in the Preview monitor.
4. Verify interaction (Transform, Crop, etc) still works in Preview.
5. Click TAKE and verify Program monitor perfectly matches Preview.
6. Verify "No Sources in Scene" appears for empty scenes.
