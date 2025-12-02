import { supabase } from '@/lib/supabaseClient';
import { createServerClient } from '@/lib/supabase/serverClient';

import Link from 'next/link';
import type { Database } from '@/types/supabase';

export const dynamic = "force-dynamic";

type BlogMeta = Database['public']['Tables']['blogs']['Row'];

async function fetchBlogs(): Promise<BlogMeta[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
  .from('blogs')
  .select('*') // fetch all columns to match type
  .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }

  console.log('DEBUG → Today:', data);

  return data ?? [];
}

export default async function BlogPage() {
  const blogs = await fetchBlogs();

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>
      <ul className="space-y-6">
        {blogs.map((blog) => (
          <li key={blog.id} className="border rounded p-4 shadow hover:shadow-lg transition-shadow">
            <Link href={`/blog/${blog.slug}`}>
              <a>
                {/*
                {blog.cover_url && (
                  <img
                    src={blog.cover_url}
                    alt={blog.title}
                    className="w-full max-h-48 object-cover rounded mb-4"
                  />
                )}
                */}
                <h2 className="text-xl font-semibold">{blog.title}</h2>
                {blog.excerpt && <p className="text-gray-600">{blog.excerpt}</p>}
                {blog.reading_time && (
                  <p className="text-sm text-gray-500 mt-1">{blog.reading_time} min read</p>
                )}
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
