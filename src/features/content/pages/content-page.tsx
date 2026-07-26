import { Field } from '@/components/common/field'
import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/ui/button'
import { Panel, PanelHead, PanelTitle } from '@/components/ui/panel'
import { Textarea } from '@/components/ui/textarea'
import { CONTENT_BLOCKS } from '@/features/content/content.mock'

export function ContentPage() {
  return (
    <>
      <PageHeader title="Content pages" subtitle="Static app content shown to users" />

      {CONTENT_BLOCKS.map((block) => (
        <Panel key={block.id}>
          <PanelHead>
            <PanelTitle>{block.title}</PanelTitle>
            <Button variant="ghost">✎ Edit</Button>
          </PanelHead>
          <Field>
            <Textarea rows={block.rows} defaultValue={block.body} />
          </Field>
        </Panel>
      ))}
    </>
  )
}
