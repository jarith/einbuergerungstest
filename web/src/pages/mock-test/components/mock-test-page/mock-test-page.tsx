import type { PageProps } from '../../../../app/routing'
import type { MockTestData } from '../../mock-test.route'

export const MockTestPage = ({ data }: PageProps<MockTestData>) => (
  <div data-test-id={data.testId} data-question-key={data.selected?.key}>
    Mock test
  </div>
)
