import { type CollectionEntry, getCollection } from 'astro:content'
import { type APIRoute } from 'astro'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import solidRenderer from '@astrojs/solid-js/server.js'

interface SearchEntry {
  slug: string
  body: string
}

const blogPages = await getCollection('blogs')

async function createSearchEntry(
  page: CollectionEntry<'blogs'>,
): Promise<SearchEntry> {
  const container = await AstroContainer.create()
  container.addServerRenderer({ renderer: solidRenderer })
  const { Content } = await page.render()
  const body = await container.renderToString(Content, {
    props: {
      frontmatter: page.data,
    },
  })

  return {
    slug: page.slug,
    body: body.replace(/(<([^>]+)>)/gi, ''),
  }
}

export const GET: APIRoute = async () => {
  const pageResults = await Promise.all(blogPages.map(createSearchEntry))
  return new Response(JSON.stringify(pageResults))
}
