import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router";
import { SEO_CONFIG } from "@/utils/seo";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  article?: boolean;
}

export function SEO({ title, description, image, article }: SEOProps) {
  const { pathname } = useLocation();

  const { siteUrl, defaultTitle, defaultDescription, defaultImage, twitterUsername } = SEO_CONFIG;

  const seo = {
    title: title ? `${title} | Sean Bearden, Ph.D.` : defaultTitle,
    description: description || defaultDescription,
    image: image?.startsWith("http") ? image : `${siteUrl}${image || defaultImage}`,
    url: `${siteUrl}${pathname}`,
  };

  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="image" content={seo.image} />

      {seo.url && <link rel="canonical" href={seo.url} />}

      {article ? (
        <meta property="og:type" content="article" />
      ) : (
        <meta property="og:type" content="website" />
      )}

      {seo.title && <meta property="og:title" content={seo.title} />}
      {seo.description && (
        <meta property="og:description" content={seo.description} />
      )}
      {seo.image && <meta property="og:image" content={seo.image} />}
      <meta property="og:url" content={seo.url} />

      <meta name="twitter:card" content="summary_large_image" />
      {twitterUsername && (
        <meta name="twitter:creator" content={twitterUsername} />
      )}
      {seo.title && <meta name="twitter:title" content={seo.title} />}
      {seo.description && (
        <meta name="twitter:description" content={seo.description} />
      )}
      {seo.image && <meta name="twitter:image" content={seo.image} />}
    </Helmet>
  );
}
