import type { ColorScheme } from '../tokens/tokens'
import { baselineTheme } from '../tokens/themes'

export const getThemeColor = (appearance: ColorScheme) => baselineTheme.colors.surface[appearance]
