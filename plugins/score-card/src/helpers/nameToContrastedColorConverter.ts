
// Represents a combination of colors with a "good" reading contrast
export type ContrastedColors = {
  background: string
  foreground: string
}

const CUSTOM_CONTRASTED_COLOR_REGEXP: RegExp = /^#[0-9a-f]{6,8}\s+#[0-9a-f]{6,8}$/i

// Thanks to ChatGPT hehe
const contrastedColorsCombinations: { [name: string]: string[] } = {
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
  // Combinations for ScoreSuccess entries
  "failure": ["#5a0000", "#ff000022"],
  "almost-failure": ["#5a0000", "#ff000022"],
  "partial": ["#5a0000", "#ff000022"],
  "almost-success": ["#0f4a0f", "#72af5026"],
  "success": ["#0f4a0f", "#72af5026"]
}


// Converts a color name to a set of background/foreground color :)
export const nameToContrastedColorConverter = (
  name: string | undefined,
): ContrastedColors => {
  // Find contrasted color from default color combinations
  if (name && name in contrastedColorsCombinations) {
    return {
      foreground: contrastedColorsCombinations[name][0],
      background: contrastedColorsCombinations[name][1],
    }
  }

  // User may provide own combination 
  // <foreground> <background>
  // example: #aaaaaaa #cccccc
  if (name?.match(CUSTOM_CONTRASTED_COLOR_REGEXP)) {
    const parts = name.split(/\s+/)
    return {
      foreground: parts[0],
      background: parts[1]
    }
  }

  // Default color 
  return nameToContrastedColorConverter('white')

}