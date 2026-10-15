import { describe, expect, test } from 'vitest'

import sourceBank from '../../../../public/questionbank-berlin.json' with { type: 'json' }
import { parseQuestionBank } from './question-bank'

describe('study-note question groups', () => {
  test('assigns every question exactly once across the fourteen sections', () => {
    const expectedQuestions = 310
    const expectedGroups = 14

    const result = parseQuestionBank(structuredClone(sourceBank))

    expect(result.questions).toHaveLength(expectedQuestions)
    expect(new Set(result.questions.map((question) => question.id)).size).toBe(expectedQuestions)
    expect(new Set(result.questions.map((question) => question.order)).size).toBe(expectedQuestions)
    expect(result.groups).toHaveLength(expectedGroups)
    expect(result.groups.map((group) => group.title_de)).toEqual([
      'Grundrechte',
      'Staatsaufbau',
      'Wahlen und Beteiligung',
      'Rechtsstaat und Gerichte',
      'Soziale Sicherheit',
      'Geschichte: bis 1945',
      'Geschichte: 1945–1990',
      'Wiedervereinigung',
      'Europa und die EU',
      'Symbole, Feiertage, Kultur',
      'Bildung, Familie, Alltag',
      'Jüdisches Leben und Antisemitismus',
      'Migration',
      'Berlin',
    ])
  })

  // Assignment specification transcribed from the study notes; see docs/question-groups.md.
  test.each([
    {
      group: 'fundamental-rights',
      expectedOrders: [1, 2, 4, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 30, 43, 274],
    },
    {
      group: 'state-structure',
      expectedOrders: [
        13, 22, 23, 24, 25, 26, 27, 31, 33, 34, 37, 38, 39, 42, 44, 48, 49, 50, 55, 56, 57, 58, 60,
        64, 65, 67, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 81, 82, 83, 84, 85, 86, 87, 88, 89,
        90, 91, 92, 93, 98, 102, 103, 171, 212, 213,
      ],
    },
    {
      group: 'elections-civic-participation',
      expectedOrders: [
        5, 28, 41, 52, 61, 62, 94, 105, 106, 107, 108, 109, 110, 112, 113, 114, 115, 116, 117, 119,
        120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 282,
      ],
    },
    {
      group: 'rule-of-law-courts',
      expectedOrders: [
        3, 32, 51, 53, 54, 63, 80, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148,
        150,
      ],
    },
    {
      group: 'social-security',
      expectedOrders: [
        35, 36, 45, 46, 47, 97, 99, 100, 101, 135, 276, 280, 283, 285, 286, 287, 291,
      ],
    },
    {
      group: 'history-until-war-end',
      expectedOrders: [152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 170, 179],
    },
    {
      group: 'postwar-history',
      expectedOrders: [
        151, 165, 166, 167, 168, 169, 172, 174, 175, 176, 177, 178, 180, 181, 183, 185, 186, 187,
        188, 189, 190, 191, 192, 193, 195, 196, 197, 198, 199, 200, 201, 202, 203, 207, 208, 209,
        210, 211, 217,
      ],
    },
    { group: 'reunification', expectedOrders: [194, 204, 205, 215, 218, 219, 228] },
    {
      group: 'europe-eu',
      expectedOrders: [
        173, 221, 222, 223, 224, 225, 226, 227, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238,
        239, 240,
      ],
    },
    {
      group: 'symbols-holidays-culture',
      expectedOrders: [21, 29, 40, 214, 216, 220, 264, 271, 292, 293, 294, 295, 296],
    },
    {
      group: 'education-family-everyday-life',
      expectedOrders: [
        68, 95, 104, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 256,
        257, 258, 259, 260, 261, 262, 263, 265, 266, 267, 268, 269, 270, 272, 273, 275, 277, 278,
        279, 281, 284, 289, 290,
      ],
    },
    {
      group: 'jewish-life-antisemitism',
      expectedOrders: [59, 66, 96, 111, 118, 149, 182, 184, 206, 288],
    },
    { group: 'migration', expectedOrders: [297, 298, 299, 300] },
    { group: 'berlin', expectedOrders: [301, 302, 303, 304, 305, 306, 307, 308, 309, 310] },
  ])('assigns the documented questions to $group', ({ group, expectedOrders }) => {
    const bank = parseQuestionBank(structuredClone(sourceBank))

    const result = bank.questions.filter((question) => question.group_id === group)

    expect(result.map((question) => question.order)).toEqual(expectedOrders)
  })
})
