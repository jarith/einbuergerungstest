import type { PageProps } from '../../../../app/routing'

export const ProgressPage = ({ data }: PageProps) => (
  <div data-question-count={data.questions.bank.question_count}>Progress</div>
)
