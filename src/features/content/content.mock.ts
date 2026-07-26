export interface ContentBlock {
  id: string
  title: string
  rows: number
  body: string
}

export const CONTENT_BLOCKS: ContentBlock[] = [
  {
    id: 'terms',
    title: 'Terms & conditions',
    rows: 4,
    body: 'By using Tobu, you agree to...',
  },
  {
    id: 'contact',
    title: 'Contact us',
    rows: 3,
    body: 'Reach us on Messenger or email support@tobu.app',
  },
]
