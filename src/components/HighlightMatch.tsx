import React from 'react';
import { normalizeArabic } from '../utils/arabicSearch';

interface HighlightMatchProps {
  text: string | undefined | null;
  query: string;
  className?: string;
  highlightClassName?: string;
}

/**
 * Escapes regex special characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Renders text with search query highlighted
 */
export const HighlightMatch: React.FC<HighlightMatchProps> = ({
  text,
  query,
  className = '',
  highlightClassName = 'bg-amber-200 text-amber-950 font-bold px-0.5 rounded-xs',
}) => {
  if (!text) return null;
  const trimmed = query.trim();
  if (!trimmed) {
    return <span className={className}>{text}</span>;
  }

  // Try direct regex match first
  try {
    const escaped = escapeRegExp(trimmed);
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);

    if (parts.length > 1) {
      return (
        <span className={className}>
          {parts.map((part, index) =>
            part.toLowerCase() === trimmed.toLowerCase() ? (
              <mark key={index} className={highlightClassName}>
                {part}
              </mark>
            ) : (
              <React.Fragment key={index}>{part}</React.Fragment>
            )
          )}
        </span>
      );
    }
  } catch (e) {
    // Fallback if regex fails
  }

  // Check normalized Arabic match fallback
  const normText = normalizeArabic(text);
  const normQuery = normalizeArabic(trimmed);

  if (normText.includes(normQuery)) {
    // If it's a normalized match but direct split didn't catch (e.g. alef difference)
    return (
      <span className={className}>
        <mark className={highlightClassName}>{text}</mark>
      </span>
    );
  }

  return <span className={className}>{text}</span>;
};
