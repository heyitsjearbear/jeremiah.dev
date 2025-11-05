import {draftMode} from 'next/headers'
import {NextResponse, type NextRequest} from 'next/server'

export async function GET(request: NextRequest) {
  const {searchParams} = new URL(request.url)
  const slug = searchParams.get('slug') ?? ''

  const draft = await draftMode()
  draft.disable()

  const redirectUrl = new URL(slug ? `/blog/${slug}` : '/blog', request.url)

  return NextResponse.redirect(redirectUrl)
}
