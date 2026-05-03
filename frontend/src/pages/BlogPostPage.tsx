import { useParams, Link, Navigate } from "react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";
import { getBlogPost, assetUrl } from "@/utils/content";
import { ArrowLeft } from "lucide-react";
import { SEO } from "@/components/common/SEO";
import { sanitizeDescription } from "@/utils/seo";

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPost(slug) : undefined;

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <SEO
        title={post.title}
        description={sanitizeDescription(post.body)}
        image={`/og/blog-${post.slug}.png`}
        article
      />
      <Link
        to="/blog"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to blog
      </Link>

      <header>
        <time className="text-sm text-muted-foreground">
          {new Date(post.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{post.title}</h1>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.categories.map((cat) => (
            <Badge key={cat} variant="outline">{cat}</Badge>
          ))}
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
      </header>

      {post.image && (
        <img
          src={assetUrl(post.image)}
          alt=""
          className="mt-8 w-full rounded-lg object-cover"
        />
      )}

      <div className="prose prose-neutral dark:prose-invert mt-8 max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
      </div>
    </article>
  );
}
