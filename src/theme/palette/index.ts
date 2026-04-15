// src/theme/palette/index.ts
import { generatePaletteChannel } from 'lib/utils';
import { basic, blue, cyan, green, grey, pink } from './colors';

export type PaletteColorKey =
  | 'primary'
  | 'secondary'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'neutral';

const common = generatePaletteChannel({ white: basic.white, black: basic.black });
const neutralGrey = generatePaletteChannel(grey);

const primary = generatePaletteChannel({
  lighter: blue[50],
  light: blue[400],
  main: blue[500], // #1E58E6
  dark: blue[600],
  darker: blue[900],
});

const secondary = generatePaletteChannel({
  lighter: pink[50],
  light: pink[300],
  main: pink[200], // #FFB5E3
  dark: pink[600],
  darker: pink[900],
});

const success = generatePaletteChannel({
  lighter: green[50],
  light: green[200],
  main: green[100], // #D9FFB3
  dark: green[600],
  darker: green[900],
});

const info = generatePaletteChannel({
  lighter: cyan[50],
  light: cyan[300],
  main: cyan[200], // #7FE1F4
  dark: cyan[600],
  darker: cyan[900],
});

const neutral = generatePaletteChannel({
  lighter: grey[100],
  light: grey[600],
  main: grey[800],
  dark: grey[900],
  darker: grey[950],
  contrastText: basic.white,
});

const background = generatePaletteChannel({
  elevation1: grey[50], // #F3EFE3
  elevation2: '#F9F6EB',
  elevation3: '#F0EDE4',
  elevation4: '#E8E4DB',
  menu: basic.white,
  menuElevation1: grey[50],
  menuElevation2: '#F9F6EB',
  menuDivider: grey[200],
});

// Keep original warning & error (safe fallback)
const warning = generatePaletteChannel({
  lighter: '#FFF4E5',
  light: '#FFB74D',
  main: '#FF9800',
  dark: '#F57C00',
  darker: '#E65100',
});

const error = generatePaletteChannel({
  lighter: '#FFEBEE',
  light: '#EF5350',
  main: '#F44336',
  dark: '#E53935',
  darker: '#C62828',
});

export const paletteOptions = {
  common,
  grey: neutralGrey,
  primary,
  secondary,
  success,
  info,
  warning,
  error,
  neutral,
  background,
};
