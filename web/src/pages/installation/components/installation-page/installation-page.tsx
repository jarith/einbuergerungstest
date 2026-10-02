import type { PageProps } from '../../../../app/routing'

export const InstallationPage = ({ data }: PageProps) => (
  <div data-question-count={data.questions.bank.question_count}>Installation</div>
)
