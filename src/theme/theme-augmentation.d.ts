import '@mui/material/Button';
import '@mui/material/Chip';
import '@mui/material/DataGrid';
import '@mui/material/Paper';
import '@mui/material/styles';
import { SxProps, Theme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  // ---------- Color channels (used by cssVarRgba) ----------
  interface ColorChannel {
    mainChannel?: string;
    lightChannel?: string;
    darkChannel?: string;
    lighterChannel?: string;
    darkerChannel?: string;
    contrastTextChannel?: string;
  }

  // Allow any string key on Color (e.g., grey['950Channel'])
  interface Color {
    [key: string]: string;
  }

  // ---------- Background extensions ----------
  interface PaletteBackground {
    elevation1?: string;
    elevation2?: string;
    elevation3?: string;
    elevation4?: string;
    elevation1Channel?: string;
    elevation2Channel?: string;
    elevation3Channel?: string;
    elevation4Channel?: string;
    menu?: string;
    menuElevation1?: string;
    menuElevation2?: string;
    menuDivider?: string;
  }

  // ---------- Custom palette colors ----------
  interface Palette {
    neutral: PaletteColor & ColorChannel;
    chGrey: Color;
    chBlue: Color;
    chGreen: Color;
    chPink?: Color;
    chCyan?: Color;
    menuDivider?: string;
    dividerLight?: string;
  }

  interface PaletteOptions {
    neutral?: Partial<PaletteColorOptions> & Partial<ColorChannel>;
    chGrey?: Partial<Color>;
    chBlue?: Partial<Color>;
    chGreen?: Partial<Color>;
    chPink?: Partial<Color>;
    chCyan?: Partial<Color>;
    menuDivider?: string;
    dividerLight?: string;
  }

  // ---------- Allow 'lighter', 'darker' and their channels ----------
  interface PaletteColor {
    lighter?: string;
    darker?: string;
    lighterChannel?: string;
    darkerChannel?: string;
  }

  interface PaletteColorOptions {
    lighter?: string;
    darker?: string;
    lighterChannel?: string;
    darkerChannel?: string;
  }

  // ---------- Action extensions ----------
  interface PaletteAction {
    disabledChannel?: string;
  }

  // ---------- Common colors (whiteChannel, blackChannel) ----------
  interface CommonColors {
    whiteChannel?: string;
    blackChannel?: string;
  }

  // ---------- CssVarsPalette (for theme.vars) ----------
  interface CssVarsPalette {
    background: PaletteBackground;
    neutral: PaletteColor & ColorChannel;
    chGrey: Color;
    chBlue: Color;
    chGreen: Color;
    chPink?: Color;
    chCyan?: Color;
    menuDivider?: string;
    dividerLight?: string;
    action: PaletteAction & ColorChannel;
    common: CommonColors;
  }

  // ---------- Theme options must accept our custom structure ----------
  interface ThemeOptions {
    palette?: Partial<PaletteOptions> & {
      background?: Partial<PaletteBackground>;
    };
  }
}

// ---------- Component color overrides ----------
declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    neutral: true;
  }
}

declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides {
    neutral: true;
  }
}

declare module '@mui/material/Radio' {
  interface RadioPropsColorOverrides {
    neutral: true;
  }
}

declare module '@mui/material/Checkbox' {
  interface CheckboxPropsColorOverrides {
    neutral: true;
  }
}

declare module '@mui/material/Pagination' {
  interface PaginationPropsColorOverrides {
    neutral: true;
  }
}

declare module '@mui/material/ToggleButton' {
  interface ToggleButtonPropsColorOverrides {
    neutral: true;
  }
}

// ---------- For @mui/x-data-grid ----------
declare module '@mui/x-data-grid' {
  interface DataGridProps {
    sx?: SxProps<Theme>;
  }
}
