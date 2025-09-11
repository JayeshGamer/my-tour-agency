"use client";

import { useEffect, useState } from 'react';

interface DateDisplayProps {
  date: string | Date;
  format?: 'short' | 'long' | 'relative';
  className?: string;
}

export function DateDisplay({ date, format = 'short', className }: DateDisplayProps) {
  const [formattedDate, setFormattedDate] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const dateObj = new Date(date);
    
    switch (format) {
      case 'short':
        setFormattedDate(dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }));
        break;
      case 'long':
        setFormattedDate(dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }));
        break;
      case 'relative':
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - dateObj.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
          setFormattedDate('Today');
        } else if (diffDays === 1) {
          setFormattedDate('Yesterday');
        } else if (diffDays < 7) {
          setFormattedDate(`${diffDays} days ago`);
        } else if (diffDays < 30) {
          const weeks = Math.floor(diffDays / 7);
          setFormattedDate(`${weeks} week${weeks > 1 ? 's' : ''} ago`);
        } else {
          setFormattedDate(dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }));
        }
        break;
      default:
        setFormattedDate(dateObj.toLocaleDateString('en-US'));
    }
  }, [date, format]);

  if (!isClient) {
    // Return a placeholder during SSR
    return <span className={className}>Loading...</span>;
  }

  return <span className={className}>{formattedDate}</span>;
}
