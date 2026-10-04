// Raw fixtures are confined to the persistence adapter, never exposed in business steps.
export const rejectedProfile = (kind: string) =>
  kind === 'corrupted' ? '{"version":3,' : '{"version":1,"studyAttempts":[]}'

export const replacementProfile = '{"version":99,"marker":"newer data"}'

export const savedProfile = async (replacement?: string): Promise<string | undefined> =>
  await new Promise((resolve, reject) => {
    const opening = indexedDB.open('einbuergerungstest-learner', 1)
    opening.onupgradeneeded = () => opening.result.createObjectStore('learner')
    opening.onerror = () => reject(opening.error ?? new Error('Cannot open test storage'))

    opening.onsuccess = () => {
      const db = opening.result

      const transaction = db.transaction(
        'learner',
        replacement === undefined ? 'readonly' : 'readwrite',
      )

      const store = transaction.objectStore('learner')

      const request =
        replacement === undefined ? store.get('snapshot') : store.put(replacement, 'snapshot')

      transaction.oncomplete = () => {
        db.close()

        resolve(replacement === undefined ? String(request.result) : replacement)
      }

      transaction.onabort = () => {
        db.close()

        reject(transaction.error ?? new Error('Test storage transaction failed'))
      }
    }
  })
