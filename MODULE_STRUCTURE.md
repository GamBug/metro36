# Project Structure - Metro Architect

Your script.js has been split into multiple specialized modules for better maintainability and organization.

## Module Organization

### Core Modules

1. **constants.js** (36 lines)
   - All configuration constants
   - CELL_SIZE, TRACK_TYPES, AUTO_MAP, METRO_COLORS, TRACK_EXITS, dirOffsets, colorNames
   - Does not depend on anything

2. **state.js** (30 lines)
   - Application state variables
   - Selection state, grid data, viewport state, reference image state
   - Depends on: constants.js

3. **cells.js** (50 lines)
   - Cell DOM creation and updates
   - Functions: createCellDOM(), updateCellDOM(), cellFirstColor()
   - Depends on: constants.js, state.js

4. **history.js** (45 lines)
   - Undo/Redo system
   - Functions: saveState(), undo(), redo(), restoreState(), snapshotCell()
   - Depends on: cells.js, state.js

5. **viewport.js** (80 lines)
   - Viewport and camera management
   - Functions: initViewport(), updateTransform(), getGridCoords(), getDefaultAutoType(), updateRefTransform()
   - Depends on: state.js, constants.js, drawing.js (commitLine)

6. **preview.js** (25 lines)
   - Preview rendering while drawing
   - Functions: updatePreview()
   - Depends on: cells.js, state.js, viewport.js, drawing.js

7. **drawing.js** (115 lines)
   - Core drawing and commit logic
   - Functions: commitLine(), resolveAutoForColor(), getLineCells()
   - Depends on: cells.js, state.js, history.js, constants.js

8. **connections.js** (20 lines)
   - Connection rendering between stations
   - Functions: renderConnections(), clearBoard()
   - Depends on: state.js, history.js, constants.js

9. **tracktable.js** (60 lines)
   - Track/station list display
   - Functions: updateTrackTable()
   - Depends on: state.js, constants.js, routing.js

10. **routing.js** (140 lines)
    - Route finding and highlighting
    - Functions: getAllStations(), updateRouteDropdowns(), buildStationGraph(), findRoute(), highlightRoute(), renderRouteResult()
    - Depends on: state.js, cells.js, constants.js

11. **fileio.js** (50 lines)
    - Save/Load map functionality
    - Functions: saveMapToFile(), loadMapFromFile(), loadMapFromUrl()
    - Depends on: cells.js, state.js, history.js, connections.js

12. **toolbar.js** (70 lines)
    - Toolbar initialization
    - Functions: initToolbar()
    - Depends on: state.js, constants.js

13. **keyboard.js** (50 lines)
    - Keyboard shortcut handling
    - All keyboard event listeners
    - Depends on: state.js, drawing.js, history.js, constants.js

14. **refimage.js** (20 lines)
    - Reference image management
    - Event listeners for uploading and adjusting reference images
    - Depends on: state.js, viewport.js

15. **main.js** (10 lines)
    - Application initialization entry point
    - Functions: initApp()
    - Depends on: All other modules

## Script Loading Order

In `index.html`, scripts are loaded in this order to ensure all dependencies are available:

1. constants.js
2. state.js
3. cells.js
4. history.js
5. viewport.js
6. preview.js
7. drawing.js
8. connections.js
9. tracktable.js
10. routing.js
11. fileio.js
12. toolbar.js
13. keyboard.js
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
