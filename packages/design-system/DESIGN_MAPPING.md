# Design extraction

Source: [`einbuergerungstest.pen`](../../einbuergerungstest.pen). The source has desktop,
iPad, and iPhone frames for home, study, mock tests, results, progress, and settings. Its
color variables define light and dark modes; its spacing and font-size reference frame
defines the named base scale. The component measurements below come from the screen
frames.

| Repeated design element                | Mantine primitive              | Package primitive | Design evidence                                               |
| -------------------------------------- | ------------------------------ | ----------------- | ------------------------------------------------------------- |
| Primary, outline, and quiet actions    | `Button`                       | `Button`          | Home actions, question navigation, dialog actions             |
| Menu and other icon-only actions       | `ActionIcon`                   | `IconButton`      | Phone header menu                                             |
| Summary, fact, and help surfaces       | `Paper`                        | `Panel`           | Home mock-test facts, study help, settings sections           |
| Single-line text and date entry        | `TextInput`                    | `TextInput`       | Planned test date and settings fields                         |
| Backup file picker                     | `FileInput`                    | `FileInput`       | Settings import backup                                        |
| Answer options                         | `Radio.Group` and `Radio.Card` | `ChoiceGroup`     | Study and mock-test A–D answers, selected and feedback states |
| Status filters and two-way preferences | `SegmentedControl`             | `SegmentedChoice` | Progress filters, language and appearance choices             |
| Translation preference                 | `Switch`                       | `ToggleSwitch`    | Study translation control                                     |
| Sidebar destinations                   | `NavLink`                      | `NavigationItem`  | Desktop and tablet navigation                                 |
| Question and test statuses             | `Badge`                        | `StatusBadge`     | Not tried, correct, incorrect, and unanswered labels          |
| Answer feedback and import errors      | `Alert`                        | `InlineNotice`    | Study feedback and invalid backup                             |
| Solved-question tracks                 | `Progress`                     | `ProgressBar`     | Home progress by group                                        |
| Confirmation overlays                  | `Modal`                        | `Dialog`          | Submit, leave, and reset confirmations                        |
| Section rules                          | `Divider`                      | `Divider`         | Home, lists, and dialog separators                            |

Question list rows, statistic tiles, countdowns, the desktop sidebar shell, mobile tab
bar, and complete question layouts are compositions of these primitives. They remain
application components because their text, routing, and state belong to the product.

## Token evidence

- `src/tokens/colors.ts` mirrors all 48 named color variables from the `.pen` file, with
  both modes. Component recipes consume role aliases in `src/tokens/semantics.ts`.
- The named spacing scale is 0, 4, 8, 12, 16, 24, and 32 px. The named font-size scale is
  12, 14, 16, 20, and 32 px. Additional 13, 15, 23, and 28 px font sizes come from answer
  descriptions, action labels, and mobile/desktop dialog titles in the screen frames.
- Shared screen geometry uses 46 px actions, 44 px fields, 28 px badges, 5 px progress
  tracks, 10 px controls, 12 px panels, and 14 px dialogs. Dialogs cap at 500 px on
  desktop and reflow within the viewport.
- The `.pen` file specifies static states and focus guidance. Hover and pressed treatments
  are derived from its `state-hover` and `state-pressed` variables; Mantine supplies the
  interaction behavior. Storybook demonstrates light/dark and keyboard states.
