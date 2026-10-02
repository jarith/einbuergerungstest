import type { PageProps } from '../../../../app/routing'
import type { TestReviewData } from '../../test-review.route'

export const TestReviewPage = ({ data }: PageProps<TestReviewData>) => (
  <div data-test-id={data.testId}>Test review</div>
)
