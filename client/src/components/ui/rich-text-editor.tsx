import React, { useState, useRef } from 'react';
import { Button } from './button';
import { Textarea } from './textarea';
import { Card } from './card';
import { 
  Image, 
  Video, 
  FileText, 
  X, 
  Link as LinkIcon,
  Loader2,
  Paperclip
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export interface MediaAttachment {
  url: string;
  publicId: string;
  type: 'image' | 'video' | 'document';
  filename: string;
  size: number;
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  attachments: MediaAttachment[];
  onAttachmentsChange: (attachments: MediaAttachment[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  attachments,
  onAttachmentsChange,
  placeholder = "Write a comment...",
  disabled = false,
  className = "",
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const uploadFile = async (file: File): Promise<MediaAttachment> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/media/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const result = await response.json();
    return result.data;
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || disabled) return;
    
    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(uploadFile);
      const uploadedFiles = await Promise.all(uploadPromises);
      onAttachmentsChange([...attachments, ...uploadedFiles]);
      toast({
        title: "Success",
        description: `${uploadedFiles.length} file(s) uploaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileSelect = () => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  };

  const removeAttachment = (index: number) => {
    const newAttachments = attachments.filter((_, i) => i !== index);
    onAttachmentsChange(newAttachments);
  };

  const insertLink = () => {
    if (!linkUrl.trim()) return;
    
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const linkText = selectedText || linkUrl;
    const linkMarkdown = `[${linkText}](${linkUrl})`;
    
    const newValue = value.substring(0, start) + linkMarkdown + value.substring(end);
    onChange(newValue);
    
    setLinkUrl('');
    setShowLinkInput(false);
    
    // Focus back to textarea
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + linkMarkdown.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Text Area */}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[70px] resize-none text-sm pr-20"
          disabled={disabled}
        />
        
        {/* Toolbar */}
        <div className="absolute bottom-2 right-2 flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={triggerFileSelect}
            disabled={disabled || isUploading}
            className="h-6 w-6 p-0 hover:bg-gray-100"
            title="Add media"
          >
            {isUploading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Paperclip className="h-3 w-3" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowLinkInput(!showLinkInput)}
            disabled={disabled}
            className="h-6 w-6 p-0 hover:bg-gray-100"
            title="Add link"
          >
            <LinkIcon className="h-3 w-3" />
          </Button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,application/pdf,text/plain"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Link Input */}
      {showLinkInput && (
        <Card className="p-3">
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Enter URL..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="flex-1 px-2 py-1 text-sm border rounded"
              onKeyPress={(e) => e.key === 'Enter' && insertLink()}
              disabled={disabled}
            />
            <Button
              type="button"
              size="sm"
              onClick={insertLink}
              disabled={!linkUrl.trim() || disabled}
              className="h-7 px-2 text-xs"
            >
              Add
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setShowLinkInput(false);
                setLinkUrl('');
              }}
              className="h-7 px-2 text-xs"
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}



      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Attachments</h4>
          <div className="grid grid-cols-1 gap-2">
            {attachments.map((attachment, index) => (
              <Card key={index} className="p-2">
                <div className="flex items-center gap-3">
                  {attachment.type === 'image' ? (
                    <img
                      src={attachment.url}
                      alt={attachment.filename}
                      className="h-12 w-12 object-cover rounded"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center">
                      {getFileIcon(attachment.type)}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{attachment.filename}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                  </div>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(index)}
                    disabled={disabled}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};