
// Represents a combination of colors with a "good" reading contrast
export type ColorCombination = {
  background: string
  foreground: string
}

const CUSTOM_COLOR_COMBINATION_CONFIG_REGEXP: RegExp = /^\S+\s+#[0-9a-f]{6,8}\s+#[0-9a-f]{6,8}$/i
const CUSTOM_COLOR_COMBINATION_INLINE_REGEXP: RegExp = /^#[0-9a-f]{6,8}\s+#[0-9a-f]{6,8}$/i

const defaultColorCombinations: { [name: string]: string[] } = {
  // Extra details colors based on score
  "extra-details-failure": ["#741f1f", "#ffe8e8"],
  "extra-details-almost-failure": ["#741f1f", "#ffe8e8"],
  "extra-details-partial": ["#741f1f", "#ffe8e8"],
  "extra-details-almost-success": ["#741f1f", "#ffe8e8"],
  "extra-details-success": ["#0f4a0f", "#72af5026"],
  "extra-details-unknown": ["#555555", "#CCCCCC"],
  // Score colors
  // see palette https://coolors.co/72af50-acbf8c-e2e8b3-ffc055-eb6f35
  "score-success": ["rgba(0, 0, 0, 0.87)", 'rgb(114, 175, 80)'],
  "score-almost-success": ["rgba(0, 0, 0, 0.87)", 'rgb(172, 191, 140)'],
  "score-partial": ["rgba(0, 0, 0, 0.87)", 'rgb(226, 232, 179)'],
  "score-almost-failure": ["rgba(0, 0, 0, 0.87)", 'rgb(255, 192, 85)'],
  "score-failure": ["rgba(0, 0, 0, 0.87)", 'rgb(235, 111, 53)'],
  "score-unknown": ["rgba(0, 0, 0, 0.87)", 'rgb(158, 158, 158)'],
  // Some colors used for labels and other things .. Thanks to ChatGPT  :)
  "white": ["#000000", "#FFFFFF"],
  "snow": ["#FFFFFF", "#001F3F"],
  "graphite": ["#555555", "#CCCCCC"],
  "arctic": ["#34495E", "#ECF0F1"],
  "steel-blue": ["#266294", "#B0C4DE"],
  "emerald": ["#23894e", "#D0ECE7"],
  "iceberg": ["#3c9366", "#DFF0E2"],
  "sapphire": ["#3498DB", "#D5EAF8"],
  "periwinkle": ["#8E44AD", "#D2B4DE"],
  "lavender": ["#6A5ACD", "#dddded"],
  "sky": ["#3498DB", "#c7e1f3"],
  "azure": ["#0074D9", "#F0FFFF"],
  "teal": ["#00877a", "#B2DFDB"],
  "cerulean": ["#003366", "#00BFFF"],
  "indigo": ["#4B0082", "#A9A9F5"],
  "olive": ["#808000", "#DAF7A6"],
  "royal": ["#88bcff", "#273746"],
  "turquoise": ["#16A085", "#E8F8F5"],
  "sage": ["#5F6A6A", "#A9DFBF"],
  "seafoam": ["#4fa573", "#E0F8D8"],
  "lilac": ["#aa71c1", "#F4ECF7"],
}

import { configApiRef, useApi } from '@backstage/core-plugin-api';

let cachedColorCombinations: { [name: string]: string[] } | undefined = undefined

// Loads color combinations
const getColorCombinations = () => {
  if (cachedColorCombinations) {
    return cachedColorCombinations;
  }

  let colorCombinations = defaultColorCombinations;
  const config = useApi(configApiRef);

  const customCombinationsString = config.getOptionalString("scorecards.colorCombinations");
  if (customCombinationsString) {
    console.debug("Custom color combinations loaded: %s", customCombinationsString)
    // Parsing the <color-name> <foreground> <background> format!
    const customCombinations = customCombinationsString.split('\n').reduce((map, line) => {
      if (line.match(CUSTOM_COLOR_COMBINATION_CONFIG_REGEXP)) {
        const configParts = line.split(/\s+/);
        map[configParts[0]] = [configParts[1], configParts[2]]
      } else {
        console.warn("Could not match scorecards.colorCombinations line [%s] with regexp [%s], which is the supported configuration format.. please follow it!", line, CUSTOM_COLOR_COMBINATION_CONFIG_REGEXP);
      }
      return map;
    }, {} as {[name: string]: string[]})

    // Overriding with custom configs :)
    colorCombinations = {
      ...colorCombinations,
      ...customCombinations
    }
  }

  // We set cachedColorCombinations atomically just in case
  cachedColorCombinations = colorCombinations
  return cachedColorCombinations
}


// Converts a color name to a set of background/foreground color :)
export const nameToColorCombinationConverter = (
  name: string | undefined,
): ColorCombination => {
  const colorCombinations = getColorCombinations();

  // Find color combination from default color combinations
  if (name && name in colorCombinations) {
    return {
      foreground: colorCombinations[name][0],
      background: colorCombinations[name][1],
    }
  }

  // User may provide own combination 
  // <foreground> <background>
  // example: #aaaaaaa #cccccc
  if (name?.match(CUSTOM_COLOR_COMBINATION_INLINE_REGEXP)) {
    const parts = name.split(/\s+/)
    return {
      foreground: parts[0],
      background: parts[1]
    }
  }

  // Default color 
  return nameToColorCombinationConverter('white')

}