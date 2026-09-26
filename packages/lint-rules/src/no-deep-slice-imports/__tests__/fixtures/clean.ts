// @ts-nocheck

import type { CalendarColorId } from '@shared/calendar-types'
import { SomeEntity } from '@entities/some-entity'
import { applyPaletteColor } from '@features/pick-mark-color'
import { CalendarPage } from '@pages/calendar'
import { computed } from '@reatom/core'
// --- Slice public API imports (allowed) ---
import { toCalendarIsoDate } from '@shared/calendar-types'
// --- External packages (allowed) ---
import { format } from 'date-fns'

import type { Baz } from './baz'
import { bar } from '../model/bar'
// --- Relative imports (allowed) ---
import { foo } from './foo'

// --- Named re-exports from public API (allowed) ---
export { foo } from '@shared/calendar-types'
export type { CalendarColorId } from '@features/pick-mark-color'
