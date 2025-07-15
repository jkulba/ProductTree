---
import { getCollection } from 'astro:content';

// Get all documentation entries for search index
const docs = await getCollection('docs');

const searchIndex = docs.map(doc => {
  // Extract content preview (first 200 characters)
  const content = doc.body || '';
  const excerpt = content.slice(0, 200).replace(/[#*`]/g, '').trim() + '...';
  
  // Extract app name from slug
  const [app] = doc.slug.split('/');
  const appName = app
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: doc.data.title,
    description: doc.data.description || excerpt,
    url: `/${doc.slug}`,
    app: appName,
    category: doc.data.category,
    tags: doc.data.tags || [],
    content: content,
    excerpt: excerpt,
    lastUpdated: doc.data.lastUpdated?.toISOString() || null,
  };
});

export async function GET() {
  return new Response(JSON.stringify(searchIndex), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
}