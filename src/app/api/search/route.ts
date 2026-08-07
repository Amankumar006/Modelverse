import { NextResponse } from 'next/server';
import { getAllModels } from '@/lib/models';
import { getAllArticles } from '@/lib/news';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    if (type === 'news') {
      const articles = await getAllArticles();
      const index = articles.map((article) => ({
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
      }));
      return NextResponse.json(index);
    } else {
      // Default to models
      const models = await getAllModels();
      const index = models.map((model) => ({
        name: model.name,
        slug: model.slug,
        developer: model.developer,
      }));
      return NextResponse.json(index);
    }
  } catch (error) {
    console.error('Search index API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
