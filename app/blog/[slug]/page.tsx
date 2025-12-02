// app/blog/[slug]/page.tsx
import { supabase } from '@/lib/supabaseClient';
import { createServerClient } from '@/lib/supabase/serverClient';


import ReactMarkdown from 'react-markdown';
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import { notFound } from 'next/navigation';
import matter from 'gray-matter'; // 👈 Add this
import type { Database } from '@/types/supabase';

type BlogRow = Database['public']['Tables']['blogs']['Row'];

async function fetchBlogBySlug(slug: string): Promise<BlogRow | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    console.error('Error fetching blog:', error);
    return null;
  }

  return data;
}

async function fetchMarkdownFromGitHub(url: string): Promise<string | null> {
  try {
    console.log("🌐 Fetching from GitHub:", url);
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
      console.error(`❌ Failed to fetch markdown from ${url}`);
      return null;
    }

    const text = await res.text();
    console.log("✅ Successfully fetched markdown, length:", text.length);
    return text;
  } catch (error) {
    console.error("🚨 Error fetching markdown:", error);
    return null;
  }
}

// ✅ Next.js 15 server component
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await fetchBlogBySlug(slug);
  if (!blog) notFound();

  const markdown = await fetchMarkdownFromGitHub(blog.source_url);
  if (!markdown) {
    return <p>Failed to load blog content.</p>;
  }

  // 🪄 Parse frontmatter and markdown content
  const { content, data: meta } = matter(markdown);

  return (
    <article className="blog-content">
      <img
        src={meta.cover_url || blog.cover_url || ''}
        alt={meta.title || blog.title}
        className="mb-6 rounded"
      />
      <h1>{meta.title || blog.title}</h1>
      <p className="text-gray-600">
        {meta.excerpt || blog.excerpt}
      </p>

      {/* Optional metadata display */}
      {meta.created_at && (
        <p className="text-sm text-gray-400 mb-4">
          {meta.created_at} • {meta.reading_time ?? blog.reading_time} min read
        </p>
      )}

      {/* Render pure markdown body */}
      <div className="blog-content">
      <ReactMarkdown
          remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        //className="prose prose-lg max-w-none"
        >
      {content}
      </ReactMarkdown>
      </div>
    </article>
  );
}


