import {draftMode} from 'next/headers'
import {NextResponse, type NextRequest} from 'next/server'
import {getPostBySlug} from '@/app/lib/sanity'

export async function GET(request: NextRequest) {
  const {searchParams} = new URL(request.url)
  const secret = searchParams.get('secret')
  const slug = searchParams.get('slug') ?? ''

  const expectedSecret = process.env.SANITY_PREVIEW_SECRET

  if (process.env.NODE_ENV === 'production') {
    if (!secret || !expectedSecret || secret !== expectedSecret) {
      return new NextResponse('Invalid secret', {status: 401})
    }
  } else if (secret && expectedSecret && secret !== expectedSecret) {
    return new NextResponse('Invalid secret', {status: 401})
  }

  const targetPath = slug ? `/blog/${slug}` : '/blog'

  if (slug) {
    const post = await getPostBySlug(slug, {preview: true})
    if (!post) {
      return new NextResponse('Post not found', {status: 404})
    }
  }

  const draft = await draftMode()
  draft.enable()

  const redirectUrl = new URL(targetPath, request.url)

  return NextResponse.redirect(redirectUrl)
}
