# Nexus Broadcast audit and repair report

Date: 2026-10-06

## Release decision

**Not production-ready.** This pass repaired the preview/program signal path and several switching defects, added repeatable audit and regression tools, and reduced dependency vulnerabilities. It did not complete the requested seven-phase transformation. A successful Vite build must not be treated as a successful TypeScript check or broadcast acceptance test.

## Audit evidence

- `baseline-static-audit.json`: 102 source files, 435 TypeScript diagnostics, 36 potentially unreachable files, 71 direct-handler review candidates, and 65 empty-function candidates before repairs.
- `static-audit.json`: current file-level diagnostics, import reachability, package imports, direct-handler candidates, and empty-function locations. Regenerate with `npm run audit:source`.
- Static findings are review candidates. The import graph does not prove that a file can be deleted; CSS URLs, string-based references, runtime registration, and unfinished features need separate review. A handler does not prove an action works.
- The repository was already heavily modified, with many untracked repair scripts, components, recovery files, and project data. These were not indiscriminately removed.

## Files removed

| File | Evidence | Reason |
| --- | --- | --- |
| `src/models/Scene.ts` | No imports found; unreachable from renderer entry point | Truncated declaration ending at an unclosed array; active types already live in `StoreTypes.ts` |
| `src/store/sceneStore.ts` | No imports found; unreachable from renderer entry point | Truncated implementation lacking its imports and interface; active application uses `NewBroadcastContext` |

Recovery copies, media assets, unused but substantial components, and previous maintenance scripts remain pending ownership and dynamic-reference review. No user project or media files were deliberately removed.

## Bugs fixed and features repaired

| Area | Cause | Change | Verification |
| --- | --- | --- | --- |
| Preview/program | Both monitors rendered stock-image mockups, with no output canvas attached | Restored 1920x1080 canvases bound to existing compositor refs, scene titles, and actual recording/stream state | Live Electron inspection showed the saved solid-color scene on both monitors |
| Main switching controls | CUT, transition selectors, AUTO, TAKE and duration had no handlers | Connected controls to shared broadcast state | Unit regression coverage and live MIX selection |
| AUTO | Delegated directly to immediate TAKE | Added timed progress, fixed target, reentry guard, cancellation and configured preview/program swap | Timing, fixed-target and cancellation regressions |
| T-bar | Main lever was decorative; sidebar slider was uncontrolled | Shared manual transition progress, completion and reverse-to-origin handling | Manual-transition regression |
| Sidebar transitions | Independent local selection and fixed duration | Shared selector, duration, presets and AUTO action | Build and state-path inspection; unsupported Fly/Stinger selectors are disabled |
| Transition composition | Scene drawing could overwrite transition opacity; frame buffers reset repeatedly | Composite complete incoming/outgoing buffers, reuse buffers, implement MIX and dip-to-black | Compositor regression tests |
| Render scheduler | Context changes restarted the scheduler every transition frame; repeated starts could create competing loops | Stable frame callback and single scheduler ownership | Scheduler regression |
| Scene list | Listed unrelated hardcoded scenes and reordered only local data | Displays saved scenes, selects preview, persists reorder, filters categories, restores Add Scene entry | Live saved-scene rendering; full CRUD UI testing remains outstanding |
| Restored projects | Stale scene IDs and orphan `_live` snapshots could leave monitors and scene list empty | Resolve invalid IDs to available scenes and retain orphan snapshots in the list | Live existing-project inspection |
| New source defaults | Missing opacity, z-index and filter array | Supply renderable defaults | Source-creation regression |
| Source filters | Add/delete functions were empty | Update the selected source's filter list | Add/delete regression |
| Scene duplication | Nested settings and filters were shared by shallow copy | Deep-copy sources and assign independent IDs | Code review; dedicated deep-copy regression remains outstanding |
| Streaming status | Marked outputs connected before backend confirmation; browser path could claim success without transport | Check explicit backend capability before capture, set success only after acknowledgement, clean up failed captures | Missing-backend regression |
| Stop stream | Referenced undefined `electron` variable; capture tracks remained live | Resolve Electron locally and release owned video tracks | Static path review; transport unavailable |
| Recording lifecycle | Repeated starts could orphan a recorder; captured video tracks were not stopped | Guard repeated starts, stop owned capture tracks, delay download URL revocation | Build; long-running recording and file integrity unverified |
| Top bar | Fixed time/date and ON AIR timer | Real clock, program name and streaming status/duration | Live build; other header telemetry is still hardcoded |
| Timeline width | Child did not occupy its flex container's width | Full-width timeline with scroll access to overflow | Live screenshot; waveform content remains synthetic |

## Security and dependency work

- Enabled Electron web security and disabled insecure mixed content.
- Denied renderer-created windows, unapproved top-level navigation, and webview attachment.
- Packaged startup loads `dist/index.html`; development tools now require `NEXUS_DEVTOOLS=1`. Vite assets use relative paths for packaged loading. Packaged distribution itself has not been built or smoke-tested.
- Added an explicit capability response reporting absent streaming, NDI and virtual-camera transports. This is an honest capability gate, not a transport implementation.
- Initial `npm audit --omit=dev`: 11 vulnerabilities (2 critical, 5 high, 4 moderate).
- Applied compatible `npm audit fix --ignore-scripts` updates, then a scoped `concurrently` override to patched `shell-quote` (`^1.11.0`). Installation scripts were not run.
- Final install audit: **6 vulnerabilities (0 critical, 2 high, 4 moderate)**. Remaining findings involve Electron, extract-zip and Electron's download/logging dependency chain. npm proposes an Electron major upgrade; it was not forced without compatibility validation.
- **Remaining release blocker:** renderer still has `nodeIntegration: true` and `contextIsolation: false`. Existing direct filesystem, child-process and Electron imports require migration to narrow, validated preload APIs before these can safely be disabled.
- Re-enabling web security may expose local-file/CORS assumptions in existing media paths. Validate those through a vetted media protocol; do not disable web security again to hide failures.

## Remaining critical functionality gaps

| Area | Concrete finding | Required next work |
| --- | --- | --- |
| RTMP/SRT/NDI/virtual camera | Main process lacks the streaming, frame/chunk, virtual-camera and statistics IPC implementations expected by renderer | Select and integrate the output engine; implement lifecycle, validation, backpressure, error reporting and process cleanup |
| Audio | `initAudioEngine` is empty; mixer channels and levels are hardcoded | Build the live audio graph, monitoring and bus routing; bind UI to real nodes and measured meters |
| Source grid | `SourcesPanel` renders `mockSources`; card controls are not connected to scene sources | Connect real source ownership, selection, visibility, lock, configuration and capture lifecycle |
| Media playback | `FrameSynchronizer` calls missing cache/texture APIs; `MediaTexture.update/destroy` are empty | Consolidate decoder, clock, bounded cache and renderer contracts; validate end/loop/seek/reverse behavior |
| Multitrack/replay | Timeline uses random waveform bars and fixed tracks/timecodes; controls are largely decorative | Implement actual recorders, file ownership, waveform indexing, seek/playback, track arming, markers and export |
| Stinger transitions | Existing renderer draws a synthetic wipe rather than configured stinger media | Decode configured media with alpha and explicit transition point; verify cancellation and audio handling |
| Output settings | Several panels report hardcoded Connected status | Bind every status to service acknowledgement; expose unavailable capabilities accurately |
| Health/analytics/telemetry | Fixed metrics, viewer totals and health values | Add real providers and explicit unavailable/error states |
| Navigation/menus/macros | Many controls lack callbacks or are swallowed by the context proxy's no-op fallbacks | Inventory each reachable control, implement typed action contracts and UI acceptance tests |
| State architecture | Duplicate context/store approaches, permissive index signatures, Proxy no-op fallbacks and broad context rerenders | Consolidate ownership, remove silent no-ops, introduce typed selectors and profile commit costs |
| Persistence | Synchronous project writes and broad localStorage serialization | Atomic asynchronous persistence, migration/schema checks, recovery and secret handling |
| Resources | Camera/media caches and recorder lifetimes are not fully reconciled with source deletion or application teardown | Track ownership; cancel async capture completions; disconnect nodes, stop tracks and revoke URLs |

## UI comparison and validation limits

The new reference uses a scene column, center monitors/source grid/timeline, and a right monitoring column. The existing shell has that overall organization, but its content and density still differ materially. Observed remaining differences include tiny header labels, a narrow navigation rail, source thumbnails compressed into short rows, horizontal mixer overflow, clipped timeline controls at a 1280x720 window, collapsed monitoring sections, and synthetic content throughout the timeline and analytics. The monitor content now represents the user's saved project rather than the reference's news imagery.

Live Electron observation verified the application mounts, displays its existing scene, renders nonblank monitor output and responds to MIX selection. It did not verify every control, every resolution, audio delivery, a recording file, live transport, a 60 FPS performance budget, soak stability, or memory leak freedom. No 2-3% reference-match claim is made.

Regression tests use deterministic hooks/timers and instrumented compositor contexts. They exercise control logic and drawing calls, not real React effect scheduling, GPU pixels, hardware devices or OS drivers.

## Cleanup and completion order

1. Keep the audit baseline; resolve active TypeScript errors without weakening compiler checks.
2. Decide the transport backend and migrate privileged access to a restricted preload boundary.
3. Repair media/audio ownership and output lifecycle before enabling broadcast controls.
4. Replace hardcoded panels with actual state, maintaining operator positions and functionality.
5. Resolve static cleanup candidates through import, runtime and asset-reference checks; then remove obsolete modules and maintenance scripts in reviewable batches.
6. Run real renderer interaction tests at target resolutions, recording round-trip tests and output tests against local receivers before external publishing.
7. Run latency, frame-drop, startup, CPU/memory and multi-hour soak measurements; package and verify clean-machine installation.

Backend decision requested: OBS/libobs integration, FFmpeg RTMP/SRT plus licensed NDI SDK, or a separately identified existing backend. Until that choice and the remaining implementation work are complete, the requested production-ready release cannot be certified.
