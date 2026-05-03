# Project Structure - Metro Architect

Your script.js has been split into multiple specialized modules organized by category for better maintainability and organization.

## Directory Organization

```
js/
├── core/              ← Core dependencies
│   ├── constants.js
│   └── state.js
├── ui/                ← UI-related modules
│   ├── cells.js
│   ├── viewport.js
│   ├── preview.js
│   ├── toolbar.js
│   └── refimage.js
├── features/          ← Feature modules
│   ├── history.js
│   ├── drawing.js
│   ├── connections.js
│   ├── tracktable.js
│   └── routing.js
├── io/                ← Input/Output
│   └── fileio.js
├── input/             ← Input handling
│   └── keyboard.js
└── main.js            ← Application entry point
```

## Module Details

### Core Modules (js/core/)

1. **constants.js** (36 lines)
   - All configuration constants
   - CELL_SIZE, TRACK_TYPES, AUTO_MAP, METRO_COLORS, TRACK_EXITS, dirOffsets, colorNames
   - Does not depend on anything

2. **state.js** (30 lines)
   - Application state variables
   - Selection state, grid data, viewport state, reference image state
   - Depends on: constants.js

### UI Modules (js/ui/)

3. **cells.js** (50 lines)
   - Cell DOM creation and updates
   - Functions: createCellDOM(), updateCellDOM(), cellFirstColor()
   - Depends on: constants.js, state.js

4. **viewport.js** (80 lines)
   - Viewport and camera management
   - Functions: initViewport(), updateTransform(), getGridCoords(), getDefaultAutoType(), updateRefTransform()
   - Depends on: state.js, constants.js, drawing.js (commitLine), preview.js (updatePreview)

5. **preview.js** (25 lines)
   - Preview rendering while drawing
   - Functions: updatePreview()
   - Depends on: cells.js, state.js, viewport.js, drawing.js

6. **toolbar.js** (70 lines)
   - Toolbar initialization
   - Functions: initToolbar()
   - Depends on: state.js, constants.js

7. **refimage.js** (20 lines)
   - Reference image management
   - Event listeners for uploading and adjusting reference images
   - Depends on: state.js, viewport.js

### Feature Modules (js/features/)

8. **history.js** (45 lines)
   - Undo/Redo system
   - Functions: saveState(), undo(), redo(), restoreState(), snapshotCell()
   - Depends on: cells.js, state.js

9. **drawing.js** (115 lines)
   - Core drawing and commit logic
   - Functions: commitLine(), resolveAutoForColor(), getLineCells()
   - Depends on: cells.js, state.js, history.js, constants.js

10. **connections.js** (20 lines)
    - Connection rendering between stations
    - Functions: renderConnections(), clearBoard()
    - Depends on: state.js, history.js, constants.js

11. **tracktable.js** (60 lines)
    - Track/station list display
    - Functions: updateTrackTable()
    - Depends on: state.js, constants.js, routing.js

12. **routing.js** (140 lines)
    - Route finding and highlighting
    - Functions: getAllStations(), updateRouteDropdowns(), buildStationGraph(), findRoute(), highlightRoute(), renderRouteResult()
    - Depends on: state.js, cells.js, constants.js

### IO Modules (js/io/)

13. **fileio.js** (50 lines)
    - Save/Load map functionality
    - Functions: saveMapToFile(), loadMapFromFile(), loadMapFromUrl()
    - Depends on: cells.js, state.js, history.js, connections.js

### Input Modules (js/input/)

14. **keyboard.js** (50 lines)
    - Keyboard shortcut handling
    - All keyboard event listeners
    - Depends on: state.js, drawing.js, history.js, constants.js

### Application Entry Point

15. **main.js** (10 lines)
    - Application initialization entry point
    - Functions: initApp()
    - Depends on: All other modules

## Script Loading Order

In `app.html`, scripts are loaded in this order to ensure all dependencies are available:

1. **Core** (constants.js, state.js)
2. **UI** (cells.js, viewport.js, preview.js, toolbar.js, refimage.js)
3. **Features** (history.js, drawing.js, connections.js, tracktable.js, routing.js)
4. **IO** (fileio.js)
5. **Input** (keyboard.js)
6. **Main** (main.js)

## Benefits of This Structure

- **Better Code Organization**: Related modules are grouped together
- **Clearer Dependencies**: Core → UI → Features shows the dependency flow
- **Easier Maintenance**: Find code by category, not just by line count
- **Scalability**: Easy to add new modules to existing categories
- **Documentation**: Clear folder names describe the purpose of each module
14. refimage.js
15. main.js

## Benefits of Modularization

✅ **Easier Maintenance** - Each module handles one specific feature
✅ **Better Organization** - Clear separation of concerns
✅ **Easier Debugging** - Smaller files are faster to search through
✅ **Code Reusability** - Functions are easier to extract and reuse
✅ **Scalability** - Easy to add new features without cluttering existing code
✅ **Team Collaboration** - Multiple developers can work on different modules simultaneously

## Future Improvements

If you continue expanding, consider:
- Creating an `ui/` folder for UI-related modules (toolbar.js, tracktable.js)
- Creating a `utils/` folder for utility functions (history.js, fileio.js)
- Creating a `graphics/` folder for rendering modules (cells.js, drawing.js, connections.js)
- Creating an `algorithms/` folder for complex logic (routing.js, drawing.js auto-resolution)

## How to Use

The app works exactly the same as before! All functionality is preserved, just split into manageable files. The HTML file loads all scripts in the correct dependency order.
