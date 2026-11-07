import React from 'react';

export const FormattedCaption = ({ caption, onHashtagClick, onUserClick }) => {
  if (!caption) return null;

  // Split by hashtags (#tag) and mentions (@user)
  const parts = caption.split(/(#[a-zA-Z0-9_]+|@[a-zA-Z0-9_]+)/g);

  return (
    <span>
      {parts.map((part, index) => {
        if (part.startsWith('#')) {
          const tag = part.slice(1);
          return (
            <span
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                if (onHashtagClick) onHashtagClick(tag);
              }}
              className="text-rose-400 font-semibold cursor-pointer hover:underline hover:text-rose-300 transition"
            >
              {part}{' '}
            </span>
          );
        }

        if (part.startsWith('@')) {
          const username = part.slice(1);
          return (
            <span
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                if (onUserClick) onUserClick(username);
              }}
              className="text-amber-400 font-semibold cursor-pointer hover:underline hover:text-amber-300 transition"
            >
              {part}{' '}
            </span>
          );
        }

        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

