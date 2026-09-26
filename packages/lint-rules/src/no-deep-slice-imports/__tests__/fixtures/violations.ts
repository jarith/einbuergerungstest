// @ts-nocheck

// --- Deep type import from @entities layer ---
import type { Foo } from '@entities/some-entity/model/foo'
// --- Deep import from @features layer ---
import { applyPaletteColor } from '@features/pick-mark-color/model/apply-palette-color'
// --- Deep import from @shared layer ---
import { toCalendarIsoDate } from '@shared/calendar-types/calendar-date-helpers'

// --- Deep re-export from @pages layer ---
export { Bar } from '@pages/calendar/ui/bar'
