import React, { useState } from 'react';
import { Bold, Italic, Heading1, Heading2, Quote, Code, Link as LinkIcon, Eye, Edit2 } from 'lucide-react';
import './RichTextEditor.css';

// Simple Markdown parser
export const parseMarkdown = (markdown = '') => {
  let html = markdown
    // Escape HTML entities to prevent XSS
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Blockquotes
  html = html.replace(/^\s*&gt;\s+(.*$)/gim, '<blockquote>$1</blockquote>');

  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Inline Code
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');

  // Code Blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Images
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width:100%; border-radius:8px;" />');

  // Unordered Lists
  html = html.replace(/^\s*-\s+(.*$)/gim, '<ul><li>$1</li></ul>');
  // Combine consecutive ul tags
  html = html.replace(/<\/ul>\s*<ul>/g, '');

  // Ordered Lists
  html = html.replace(/^\s*\d+\.\s+(.*$)/gim, '<ol><li>$1</li></ol>');
  // Combine consecutive ol tags
  html = html.replace(/<\/ol>\s*<ol>/g, '');

  // Line breaks
  html = html.replace(/\n$/gim, '<br />');
  html = html.replace(/\n\n/g, '</p><p>');
  
  return `<p>${html}</p>`;
};

const RichTextEditor = ({ value, onChange, placeholder = 'Write your story in Markdown...' }) => {
  const [activeTab, setActiveTab] = useState('write'); // 'write' or 'preview'

  const insertHelper = (syntaxBefore, syntaxAfter = '') => {
    const textarea = document.getElementById('markdown-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    const replacement = syntaxBefore + (selectedText || 'text') + syntaxAfter;
    
    onChange(text.substring(0, start) + replacement + text.substring(end));
    
    // Reset cursor focus
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + syntaxBefore.length, start + syntaxBefore.length + (selectedText || 'text').length);
    }, 0);
  };

  return (
    <div className="rich-editor card">
      <div className="editor-header">
        <div className="editor-toolbar">
          <button type="button" onClick={() => insertHelper('**', '**')} title="Bold"><Bold size={16} /></button>
          <button type="button" onClick={() => insertHelper('*', '*')} title="Italic"><Italic size={16} /></button>
          <button type="button" onClick={() => insertHelper('# ', '')} title="Heading 1"><Heading1 size={16} /></button>
          <button type="button" onClick={() => insertHelper('## ', '')} title="Heading 2"><Heading2 size={16} /></button>
          <button type="button" onClick={() => insertHelper('> ', '')} title="Blockquote"><Quote size={16} /></button>
          <button type="button" onClick={() => insertHelper('`', '`')} title="Inline Code"><Code size={16} /></button>
          <button type="button" onClick={() => insertHelper('[', '](url)')} title="Link"><LinkIcon size={16} /></button>
        </div>

        <div className="editor-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'write' ? 'active' : ''}`}
            onClick={() => setActiveTab('write')}
          >
            <Edit2 size={14} />
            Write
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            <Eye size={14} />
            Preview
          </button>
        </div>
      </div>

      <div className="editor-body">
        {activeTab === 'write' ? (
          <textarea
            id="markdown-textarea"
            className="editor-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={15}
          />
        ) : (
          <div
            className="editor-preview rich-content"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(value) }}
          />
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;
