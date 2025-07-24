// Test script to verify search functionality
import { getCollection } from 'astro:content';

async function testSearchIndex() {
  try {
    console.log('🔍 Testing search index generation...');
    
    // Get all documentation entries
    const docs = await getCollection('docs');
    console.log(`📚 Found ${docs.length} documents`);
    
    // Process each document
    docs.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.data.title} (${doc.slug})`);
      console.log(`   Content length: ${doc.body?.length || 0} characters`);
      console.log(`   Description: ${doc.data.description || 'None'}`);
      console.log('');
    });
    
    // Test search index structure
    const searchIndex = docs.map(doc => {
      const content = doc.body || '';
      const excerpt = content.slice(0, 200).replace(/[#*`]/g, '').trim() + '...';
      
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
        content: content,
        excerpt: excerpt
      };
    });
    
    console.log('🎯 Search index sample:');
    console.log(JSON.stringify(searchIndex[0], null, 2));
    
    console.log('✅ Search index test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing search index:', error);
  }
}

testSearchIndex();
