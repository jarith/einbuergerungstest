# Study-note question groups

The fourteen groups follow the numbered headings in `einbuergerungstest-notes.md`, in
document order. Descriptions summarize each section in English and German using the
existing bank fields. Each question belongs to exactly one group.

| Group                                                           | Questions | Question numbers                                                                                                                                                                                                                    |
| --------------------------------------------------------------- | --------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Grundrechte (`fundamental-rights`)                              |        20 | 1, 2, 4, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 30, 43, 274                                                                                                                                                            |
| Staatsaufbau (`state-structure`)                                |        56 | 13, 22, 23, 24, 25, 26, 27, 31, 33, 34, 37, 38, 39, 42, 44, 48, 49, 50, 55, 56, 57, 58, 60, 64, 65, 67, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 98, 102, 103, 171, 212, 213 |
| Wahlen und Beteiligung (`elections-civic-participation`)        |        36 | 5, 28, 41, 52, 61, 62, 94, 105, 106, 107, 108, 109, 110, 112, 113, 114, 115, 116, 117, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 282                                                          |
| Rechtsstaat und Gerichte (`rule-of-law-courts`)                 |        21 | 3, 32, 51, 53, 54, 63, 80, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 150                                                                                                                                     |
| Soziale Sicherheit (`social-security`)                          |        17 | 35, 36, 45, 46, 47, 97, 99, 100, 101, 135, 276, 280, 283, 285, 286, 287, 291                                                                                                                                                        |
| Geschichte: bis 1945 (`history-until-war-end`)                  |        15 | 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 170, 179                                                                                                                                                           |
| Geschichte: 1945–1990 (`postwar-history`)                       |        39 | 151, 165, 166, 167, 168, 169, 172, 174, 175, 176, 177, 178, 180, 181, 183, 185, 186, 187, 188, 189, 190, 191, 192, 193, 195, 196, 197, 198, 199, 200, 201, 202, 203, 207, 208, 209, 210, 211, 217                                   |
| Wiedervereinigung (`reunification`)                             |         7 | 194, 204, 205, 215, 218, 219, 228                                                                                                                                                                                                   |
| Europa und die EU (`europe-eu`)                                 |        20 | 173, 221, 222, 223, 224, 225, 226, 227, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240                                                                                                                                  |
| Symbole, Feiertage, Kultur (`symbols-holidays-culture`)         |        13 | 21, 29, 40, 214, 216, 220, 264, 271, 292, 293, 294, 295, 296                                                                                                                                                                        |
| Bildung, Familie, Alltag (`education-family-everyday-life`)     |        42 | 68, 95, 104, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 265, 266, 267, 268, 269, 270, 272, 273, 275, 277, 278, 279, 281, 284, 289, 290                      |
| Jüdisches Leben und Antisemitismus (`jewish-life-antisemitism`) |        10 | 59, 66, 96, 111, 118, 149, 182, 184, 206, 288                                                                                                                                                                                       |
| Migration (`migration`)                                         |         4 | 297, 298, 299, 300                                                                                                                                                                                                                  |
| Berlin (`berlin`)                                               |        10 | 301, 302, 303, 304, 305, 306, 307, 308, 309, 310                                                                                                                                                                                    |

Total: **310 questions, 310 unique IDs, no duplicate assignments**.

## Assignment decisions

Use the section containing the fact when themes overlap. In particular, party names,
coalitions, parliamentary seats, the social market economy, and the Federal Cross of Merit
belong to State structure; complaints to authorities and tax questions belong to Social
security. The 27 January remembrance question belongs to Symbols, holidays, and culture;
the November 1938 pogroms belong to History: up to 1945; Stolpersteine belong to Jewish
life and antisemitism. Family protections, criminal responsibility at age fourteen,
discrimination examples, and registering demonstrations belong to Education, family, and
everyday life. The history period headings overlap at 1945 and 1990: surrender ends the
first period; occupation and the GDR belong to postwar history; accession and its
consequences belong to Reunification.

## Existing learners

Question IDs, order, wording, answers, and illustrations are unchanged. Study and
completed-mock attempts remain the source of learning status and group totals. On startup,
including after an installed PWA updates, the app removes bookmarks for the eleven retired
groups before reference validation. All-question, Berlin, and Europe bookmarks remain
valid because their question sequences are unchanged. New groups start a new pass; prior
answers still count immediately. Repeated launches preserve the migrated profile. Backup
import applies the same normalization before preview, but exporting or importing is not
necessary for the automatic upgrade.

The saved schema remains version 3: no stored facts change shape. Invalid question
references are still rejected. The existing atomic write and conflict checks apply. Saved
mock papers retain their question lists and results. New mock papers use the
[revised allocation table](requirements.md#mock-paper-selection).

Online PWA launches/resumes use the existing automatic update and reload path. The
generated service worker revisions include the question-bank contents. Offline installs
keep their previous release until reconnected; active exams and pending writes retain the
existing activation protection.
