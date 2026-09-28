import type { PageProps } from '../../../../app/routing'

export const DashboardPage = ({ data }: PageProps) => (
  <div data-question-count={data.questions.bank.question_count}>Dashboard</div>
)
