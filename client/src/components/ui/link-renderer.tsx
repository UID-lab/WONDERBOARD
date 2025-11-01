import React from 'react';
import { ExternalLink } from 'lucide-react';

interface LinkRendererProps {
  content: string;
  className?: string;
}

export const LinkRenderer: React.FC<LinkRendererProps> = ({ 
  content, 
  className = "" 
}) => {
  // Regular expression to match markdown links [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  
  // Split content by links and render accordingly
  const renderContent = () => {
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }

      // Add the link
      const linkText = match[1];
      const linkUrl = match[2];
      
      parts.push(
        <a
          key={match.index}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
        >
          {linkText}
          <ExternalLink className="h-3 w-3" />
        </a>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after the last link
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    return parts.length > 0 ? parts : [content];
  };

  return (
    <div className={`whitespace-pre-wrap leading-relaxed ${className}`}>
      {renderContent()}
    </div>
  );
};