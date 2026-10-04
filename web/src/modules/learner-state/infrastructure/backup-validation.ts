/* oxlint-disable app/no-runtime-typeof, app/no-unknown-parameters -- Validate imported JSON before recursive snapshot decoding. */
import type { JsonValue } from '../../question-bank/domain'
import type { LearnerSnapshot } from '../domain/learner-state'
import { parseLearnerSnapshot } from './snapshot-codec'

export const getBackupSizeLimit = () => 10 * 1024 * 1024

// The stored schema needs at most five nested containers. Bound every value, including
// unknown fields, before the snapshot codec performs its recursive validation.
const isBackupValue = (value: unknown, depth: number): value is JsonValue => {
  if (depth > 8) {
    return false
  }

  if (value === null || typeof value === 'boolean') {
    return true
  }

  if (typeof value === 'string') {
    return value.length <= 64
  }

  if (typeof value === 'number') {
    return Number.isFinite(value)
  }

  if (Array.isArray(value)) {
    return value.length <= 50_000 && value.every((entry) => isBackupValue(entry, depth + 1))
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value)

    return (
      entries.length <= 64 &&
      entries.every(([key, entry]) => key.length <= 64 && isBackupValue(entry, depth + 1))
    )
  }

  return false
}

export const decodeLearnerBackup = (source: string, now: number): LearnerSnapshot => {
  if (
    source.length > getBackupSizeLimit() ||
    new TextEncoder().encode(source).byteLength > getBackupSizeLimit()
  ) {
    throw new Error('Backup exceeds 10 MiB. Choose a smaller backup; saved progress is unchanged.')
  }
  const value: unknown = JSON.parse(source)

  if (!isBackupValue(value, 0)) {
    throw new Error(
      'Backup exceeds the supported structure or history limits. Choose another backup.',
    )
  }
  const snapshot = parseLearnerSnapshot(value)

  if (snapshot.mockSittings.length > 1_000) {
    throw new Error('Backup exceeds 1,000 mock tests. Choose a smaller backup.')
  }

  // Allow a day of device-clock skew at import only. Do not impose a moving wall-clock
  // limit on existing storage or on the monotonic timestamps generated while studying.
  const latest = now + 24 * 60 * 60 * 1000

  if (
    !Number.isSafeInteger(latest) ||
    now < 0 ||
    latest > 8.64e15 - 2 * 24 * 60 * 60 * 1000 ||
    snapshot.studyAttempts.some((attempt) => attempt.answeredAt > latest) ||
    snapshot.mockSittings.some(
      (sitting) =>
        sitting.startedAt > latest || (sitting.status !== 'active' && sitting.endedAt > latest),
    )
  ) {
    throw new Error(
      'Backup contains future history. Check the device clock or choose another backup.',
    )
  }

  return snapshot
}
