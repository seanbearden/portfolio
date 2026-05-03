import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { getBlogPosts, assetUrl } from "@/utils/content";

export function BlogPage() {
  const posts = getBlogPosts();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
      <p className="mt-2 text-muted-foreground">
        Writing about data science, AI, cloud architecture, and the journey from physics to tech.
      </p>

      <div className="mt-8 space-y-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            to={`/blog/${post.slug}`}
            className="group block rounded-lg border p-5 transition-colors hover:bg-muted/50"
          >
            <div className="flex gap-4">
              {post.image && (
                <img
                  src={assetUrl(post.image)}
                  alt=""
                  className="hidden h-20 w-20 shrink-0 rounded-md object-cover sm:block"
                  loading="lazy"
                />
              )}
              <div className="flex-1">
                <time className="text-xs text-muted-foreground">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <h2 className="mt-1 font-semibold group-hover:underline">
                  {post.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {post.body.slice(0, 180)}...
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {post.categories.map((cat) => (
                    <Badge key={cat} variant="outline" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
