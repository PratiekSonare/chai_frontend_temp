# State Map Plotter Component

A React component for creating interactive state maps using D3.js and GeoJSON data.

## Features

- 📊 Interactive state plotting with hover and click events
- 🎨 Customizable colors, tooltips, and styling
- 🗺️ Built-in support for India GeoJSON data
- ⚡ TypeScript support with complete type definitions
- 🎯 Responsive design with customizable dimensions
- 🛠️ Utility functions for data processing and color generation

## Installation

First, install the required dependencies:

```bash
npm install d3 d3-geo d3-selection
npm install --save-dev @types/d3 @types/d3-geo @types/d3-selection
```

## Quick Start

```tsx
import StateMapPlotter, { StateData } from '@/components/StateMapPlotter';

const myData: StateData[] = [
  { name: 'Maharashtra', value: 3200, color: '#4ecdc4' },
  { name: 'Tamil Nadu', value: 2100, color: '#45b7d1' },
  { name: 'Karnataka', value: 1800, color: '#96ceb4' }
];

function MyMapComponent() {
  return (
    <StateMapPlotter
      width={800}
      height={600}
      data={myData}
      onStateClick={(name, value) => console.log(`${name}: ${value}`)}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `number` | `800` | Map width in pixels |
| `height` | `number` | `600` | Map height in pixels |
| `data` | `StateData[]` | `[]` | Array of state data with name, value, and optional color |
| `geoJsonPath` | `string` | `'/in.json'` | Path to GeoJSON file |
| `onStateClick` | `(name: string, value: number) => void` | - | Callback when a state is clicked |
| `onStateHover` | `(name: string, value: number) => void` | - | Callback when a state is hovered |
| `className` | `string` | `''` | Additional CSS classes |
| `strokeColor` | `string` | `'#fff'` | Border color for states |
| `strokeWidth` | `number` | `0.1` | Border width for states |
| `hoverStrokeColor` | `string` | `'#000'` | Border color on hover |
| `hoverStrokeWidth` | `number` | `1.2` | Border width on hover |
| `defaultFillColor` | `string` | `'#e5e7eb'` | Default fill color for states without data |
| `tooltipFormatter` | `(name: string, value: number) => string` | - | Custom tooltip HTML formatter |

## StateData Interface

```typescript
interface StateData {
  name: string;      // State name (must match GeoJSON properties.name)
  value: number;     // Numeric value for the state
  color?: string;    // Optional color (hex or CSS color)
}
```

## Advanced Usage

### Custom Tooltip

```tsx
const customTooltip = (stateName: string, value: number) => `
  <div style="padding: 10px; background: #333; color: white; border-radius: 4px;">
    <h3>${stateName}</h3>
    <p>Population: ${value.toLocaleString()}</p>
  </div>
`;

<StateMapPlotter
  data={data}
  tooltipFormatter={customTooltip}
/>
```

### Using Color Scale Utilities

```tsx
import { generateColorScale, colorPalettes } from '@/lib/mapUtils';

const statesWithColors = generateColorScale(myData, colorPalettes.blues);

<StateMapPlotter data={statesWithColors} />
```

### Processing CSV/Excel Data

```tsx
import { mapDataToStates, normalizeStateName } from '@/lib/mapUtils';

// Convert raw data to StateData format
const csvData = [
  { state_name: 'Maharashtra', sales: 5000 },
  { state_name: 'Karnataka', sales: 3000 }
];

const stateData = mapDataToStates(csvData, 'state_name', 'sales')
  .map(state => ({
    ...state,
    name: normalizeStateName(state.name) // Normalize for GeoJSON matching
  }));
```

## Utility Functions

### Color Generation

- `generateColorScale(data, colorRange)` - Generate color scale based on values
- `interpolateColor(color1, color2, factor)` - Interpolate between two colors
- `colorPalettes` - Predefined color palettes (blues, greens, reds, etc.)

### Data Processing

- `mapDataToStates(rawData, stateField, valueField, colorField)` - Convert CSV/Excel data
- `normalizeStateName(name)` - Normalize state names for GeoJSON matching
- `calculateStats(data)` - Calculate mean, median, min, max, sum for the dataset

## GeoJSON Data

The component expects GeoJSON data where each feature has:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "properties": {
        "name": "State Name"
      },
      "geometry": { ... }
    }
  ]
}
```

Make sure your GeoJSON file is accessible at the path specified in `geoJsonPath` prop.

## Examples

Check the following files for complete examples:

- `src/components/StateMapExample.tsx` - Complete usage example with sample data
- `src/app/map/page.tsx` - Next.js page implementation
- `src/lib/mapUtils.ts` - Utility functions for data processing

## Browser Support

This component uses modern JavaScript features and D3.js. Ensure your target browsers support:

- ES6+ features
- SVG rendering
- Modern React (18+)

## Performance Tips

1. Use dynamic imports for SSR applications (Next.js example included)
2. Limit the number of data points for better performance
3. Use `React.memo` if re-rendering frequently
4. Consider virtualizing for very large datasets

## Troubleshooting

**Map not rendering**: Ensure GeoJSON file is accessible and D3.js dependencies are installed.

**State names not matching**: Use `normalizeStateName()` utility to standardize state names.

**SSR issues**: Use dynamic imports with `ssr: false` for Next.js applications.