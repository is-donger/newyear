
import React, { useRef, useState, useEffect } from 'react';

interface EditableTextProps {
  text: string;
  className?: string;
  onChange: (newText: string) => void;
}

const EditableText: React.FC<EditableTextProps> = ({ text, className, onChange }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleBlur = () => {
    setIsEditing(false);
    if (elementRef.current) {
      onChange(elementRef.current.innerText);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  useEffect(() => {
    if (isEditing && elementRef.current) {
      elementRef.current.focus();
      // Select all text when starting to edit
      const range = document.createRange();
      range.selectNodeContents(elementRef.current);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing]);

  return (
    <div
      ref={elementRef}
      contentEditable={isEditing}
      suppressContentEditableWarning
      className={`transition-colors rounded px-2 outline-none ${
        isEditing ? 'bg-white/20 cursor-text shadow-inner' : 'cursor-pointer hover:bg-white/5'
      } ${className}`}
      onDoubleClick={handleDoubleClick}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          elementRef.current?.blur();
        }
        e.stopPropagation(); // Always stop keys from bubbling to prompter nav while editing
      }}
    >
      {text}
    </div>
  );
};

export default EditableText;
