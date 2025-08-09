import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface ImagePreviewProps {
  pendingImagePreviewUrl: string | null;
  handleRemovePendingImage: () => void;
  pendingImageFile: File | null;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  pendingImagePreviewUrl,
  handleRemovePendingImage,
  pendingImageFile
}) => (
  pendingImagePreviewUrl ? (
    <div className="mb-2 ml-10 sm:ml-12 relative self-start">
      <div className="rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden inline-block bg-gray-100 dark:bg-gray-700 p-1 shadow-sm">
        <img src={pendingImagePreviewUrl} alt="Image upload preview" className="max-h-24 sm:max-h-32 w-auto object-cover rounded" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="destructive" size="icon" className="absolute top-0 right-0 m-0.5 bg-black/60 hover:bg-black/80 text-white rounded-full h-5 w-5 p-0.5 opacity-80 hover:opacity-100" onClick={handleRemovePendingImage} aria-label="Remove attached image">
              <X className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top"><p>Remove Image</p></TooltipContent>
        </Tooltip>
      </div>
    </div>
  ) : null
);

export default ImagePreview;
