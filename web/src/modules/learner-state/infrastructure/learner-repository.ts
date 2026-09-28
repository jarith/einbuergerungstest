/* oxlint-disable app/no-runtime-typeof -- IndexedDB returns untrusted persisted values. */
import type { LearnerSnapshot } from '../domain/learner-state'
import { createLearnerStateConflictError } from './learner-state-conflict-error'
import { decodeLearnerSnapshot } from './snapshot-codec'

type TransactionOutcome = { failure: Error | undefined }

const databaseName = 'einbuergerungstest-learner'

const storeName = 'learner'

const snapshotKey = 'snapshot'

const storageTimeout = 30_000

const openDatabase = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    if (typeof globalThis.indexedDB === 'undefined') {
      reject(new Error('Device storage is unavailable. Enable browser storage and reload.'))

      return
    }
    const request = indexedDB.open(databaseName, 1)
    const connection = { isAbandoned: false }

    const timer = setTimeout(() => {
      connection.isAbandoned = true

      reject(new Error('Device storage took too long to open. Close other app tabs and retry.'))
    }, storageTimeout)

    request.onupgradeneeded = () => {
      // First schema. Future upgrades must explicitly migrate, never delete learner facts.
      request.result.createObjectStore(storeName)
    }

    request.onblocked = () => {
      connection.isAbandoned = true

      clearTimeout(timer)

      reject(new Error('Device storage upgrade is blocked. Close other app tabs and reload.'))
    }

    request.onerror = () => {
      clearTimeout(timer)

      reject(
        new Error('Could not open device storage. Check browser storage permissions and reload.', {
          cause: request.error,
        }),
      )
    }

    request.onsuccess = () => {
      clearTimeout(timer)

      const database = request.result
      database.onversionchange = () => database.close()

      if (connection.isAbandoned) {
        database.close()

        return
      }

      resolve(database)
    }
  })

export const createLearnerRepository = () => {
  const read = async (): Promise<LearnerSnapshot | null> => {
    const database = await openDatabase()
    try {
      return await new Promise<LearnerSnapshot | null>((resolve, reject) => {
        const transaction = database.transaction(storeName, 'readonly')
        const request = transaction.objectStore(storeName).get(snapshotKey)
        const timer = setTimeout(() => transaction.abort(), storageTimeout)

        transaction.onabort = () => {
          clearTimeout(timer)

          reject(
            new Error('Could not read device storage. Reload to retry.', {
              cause: transaction.error,
            }),
          )
        }

        transaction.oncomplete = () => {
          clearTimeout(timer)

          const value: unknown = request.result

          if (value === undefined) {
            resolve(null)
          } else if (typeof value === 'string') {
            try {
              resolve(decodeLearnerSnapshot(value))
            } catch (error: unknown) {
              reject(
                error instanceof Error
                  ? error
                  : new Error('Saved learner data could not be read.', { cause: error }),
              )
            }
          } else {
            reject(new Error('Saved learner data is invalid. Existing storage has been preserved.'))
          }
        }
      })
    } finally {
      database.close()
    }
  }

  const replace = async (
    snapshot: LearnerSnapshot,
    expected: LearnerSnapshot | null,
  ): Promise<void> => {
    const serialized = JSON.stringify(decodeLearnerSnapshot(JSON.stringify(snapshot)))
    const previous = expected === null ? undefined : JSON.stringify(expected)
    const database = await openDatabase()
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(storeName, 'readwrite')
        const store = transaction.objectStore(storeName)
        const request = store.get(snapshotKey)
        const outcome: TransactionOutcome = { failure: undefined }
        const timer = setTimeout(() => transaction.abort(), storageTimeout)

        transaction.oncomplete = () => {
          clearTimeout(timer)

          resolve()
        }

        transaction.onabort = () => {
          clearTimeout(timer)

          reject(
            outcome.failure ??
              new Error('Progress could not be saved. Check available device storage and retry.', {
                cause: transaction.error,
              }),
          )
        }

        request.onsuccess = () => {
          const current: unknown = request.result

          if (current !== previous) {
            outcome.failure = createLearnerStateConflictError()

            transaction.abort()

            return
          }

          store.put(serialized, snapshotKey)
        }
      })
    } finally {
      database.close()
    }
  }

  return { read, replace }
}
