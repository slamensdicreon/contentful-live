import { documentToReactComponents, Options } from '@contentful/rich-text-react-renderer';
import { BLOCKS, INLINES, Document } from '@contentful/rich-text-types';
import { Link } from 'react-router-dom';

interface RichTextProps {
  content: Document | unknown;
  className?: string;
}

const options: Options = {
  renderNode: {
    [BLOCKS.HEADING_1]: (node, children) => (
      <h1 className="font-display text-4xl font-bold text-foreground mb-6">{children}</h1>
    ),
    [BLOCKS.HEADING_2]: (node, children) => (
      <h2 className="font-display text-3xl font-bold text-foreground mb-4">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (node, children) => (
      <h3 className="font-display text-2xl font-semibold text-foreground mb-3">{children}</h3>
    ),
    [BLOCKS.HEADING_4]: (node, children) => (
      <h4 className="font-display text-xl font-semibold text-foreground mb-2">{children}</h4>
    ),
    [BLOCKS.PARAGRAPH]: (node, children) => (
      <p className="text-muted-foreground leading-relaxed mb-4">{children}</p>
    ),
    [BLOCKS.UL_LIST]: (node, children) => (
      <ul className="list-disc list-inside mb-4 space-y-2 text-muted-foreground">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (node, children) => (
      <ol className="list-decimal list-inside mb-4 space-y-2 text-muted-foreground">{children}</ol>
    ),
    [BLOCKS.LIST_ITEM]: (node, children) => (
      <li>{children}</li>
    ),
    [BLOCKS.QUOTE]: (node, children) => (
      <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">
        {children}
      </blockquote>
    ),
    [BLOCKS.HR]: () => <hr className="my-8 border-border" />,
    [INLINES.HYPERLINK]: (node, children) => {
      const href = node.data.uri as string;
      const isInternal = href.startsWith('/');
      
      if (isInternal) {
        return (
          <Link to={href} className="text-primary hover:underline">
            {children}
          </Link>
        );
      }
      
      return (
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {children}
        </a>
      );
    },
  },
};

export function RichText({ content, className = '' }: RichTextProps) {
  if (!content) return null;
  
  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      {documentToReactComponents(content as Document, options)}
    </div>
  );
}
