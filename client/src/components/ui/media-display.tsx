import React, { useState } from 'react';
import { Card } from './card';
import { Button } from './button';
import { 
  Image, 
  Video, 
  FileText, 
  ExternalLink, 
  Download,
  X,
  ZoomIn
} from 'lucide-react';

export interface MediaAttachment {
  url: string;
  publicId: string;
  type: 'image' | 'video' | 'document';
  filename: string;
  size: number;
}

interface MediaDisplayProps {
  attachments: MediaAttachment[];
  className?: string;
}

interface ImageModalProps {
  src: string;
  alt: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ src, alt, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div className="relative max-w-full max-h-full">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-2 right-2 text-white hover:bg-white/20 z-10"
        >
          <X className="h-4 w-4" />
        </Button>
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

export const MediaDisplay: React.FC<MediaDisplayProps> = ({ 
  attachments, 
  className = "" 
}) => {
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);

  if (attachments.length === 0) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className={`space-y-2 ${className}`}>
        <div className="grid grid-cols-1 gap-2">
          {attachments.map((attachment, index) => (
            <Card key={index} className="p-2 hover:shadow-sm transition-shadow">
              {attachment.type === 'image' ? (
                <div className="space-y-2">
                  <div className="relative group">
                    <img
                      src={attachment.url}
                      alt={attachment.filename}
                      className="w-full max-w-sm h-auto rounded cursor-pointer"
                      onClick={() => setSelectedImage({ 
                        src: attachment.url, 
                        alt: attachment.filename 
                      })}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded flex items-center justify-center">
                      <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{attachment.filename}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(attachment.url, '_blank')}
                        className="h-6 w-6 p-0"
                        title="Open in new tab"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(attachment.url, attachment.filename)}
                        className="h-6 w-6 p-0"
                        title="Download"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : attachment.type === 'video' ? (
                <div className="space-y-2">
                  <video
                    src={attachment.url}
                    controls
                    className="w-full max-w-sm h-auto rounded"
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{attachment.filename}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(attachment.url, '_blank')}
                        className="h-6 w-6 p-0"
                        title="Open in new tab"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(attachment.url, attachment.filename)}
                        className="h-6 w-6 p-0"
                        title="Download"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                    {getFileIcon(attachment.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{attachment.filename}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(attachment.url, '_blank')}
                      className="h-6 w-6 p-0"
                      title="Open in new tab"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(attachment.url, attachment.filename)}
                      className="h-6 w-6 p-0"
                      title="Download"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          src={selectedImage.src}
          alt={selectedImage.alt}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
};