import type { PageProps } from '../../../../app/routing'

export const SettingsPage = ({ data }: PageProps) => (
  <div data-question-count={data.questions.bank.question_count}>Settings</div>
)
