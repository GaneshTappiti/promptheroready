// Presentation Card Component - Display presentation in grid/list view

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Presentation,
  MoreHorizontal,
  Eye,
  Edit,
  Share,
  Download,
  Copy,
  Trash2,
  Clock,
  Users,
  Sparkles,
  Calendar
} from 'lucide-react';
import { Presentation as PresentationType } from '@/types/presentation';
import { getTheme } from '@/lib/presentation/themes';
import { formatDistanceToNow } from 'date-fns';

interface PresentationCardProps {
  presentation: PresentationType;
  onClick: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
  viewMode?: 'grid' | 'list';
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
}

const PresentationCard: React.FC<PresentationCardProps> = ({
  presentation,
  onClick,
  onEdit,
  onDuplicate,
  onShare,
  onDelete,
  onDownload,
  viewMode = 'grid',
  isSelected = false,
  onSelect
}) => {
  const theme = getTheme(presentation.theme, presentation.customTheme);
  
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger onClick if clicking on dropdown or select checkbox
    if ((e.target as HTMLElement).closest('[data-dropdown]') || 
        (e.target as HTMLElement).closest('[data-select]')) {
      return;
    }
    onClick();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (viewMode === 'list') {
    return (
      <Card 
        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
          isSelected ? 'ring-2 ring-purple-500' : ''
        }`}
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              {/* Selection Checkbox */}
              {onSelect && (
                <div data-select>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelect(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </div>
              )}

              {/* Presentation Preview */}
              <div 
                className="w-16 h-12 rounded-lg flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: (theme as any).colors.primary }}
              >
                <Presentation className="h-6 w-6" />
              </div>

              {/* Presentation Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg truncate">{presentation.title}</h3>
                  <Badge className={getStatusColor(presentation.status)}>
                    {presentation.status}
                  </Badge>
                  {presentation.outline && (
                    <Badge variant="outline" className="text-purple-600">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Generated
                    </Badge>
                  )}
                </div>
                
                {presentation.description && (
                  <p className="text-sm text-muted-foreground truncate mb-2">
                    {presentation.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Presentation className="h-3 w-3" />
                    {presentation.totalSlides} slides
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {presentation.estimatedDuration || 15} min
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(presentation.updatedAt), { addSuffix: true })}
                  </div>
                  {presentation.targetAudience && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {presentation.targetAudience}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onClick}>
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild data-dropdown>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={onEdit}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDuplicate && (
                    <DropdownMenuItem onClick={onDuplicate}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                  )}
                  {onShare && (
                    <DropdownMenuItem onClick={onShare}>
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                  )}
                  {onDownload && (
                    <DropdownMenuItem onClick={onDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={onDelete} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
        isSelected ? 'ring-2 ring-purple-500' : ''
      }`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getStatusColor(presentation.status)}>
                {presentation.status}
              </Badge>
              {presentation.outline && (
                <Badge variant="outline" className="text-purple-600">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-lg leading-tight truncate">
              {presentation.title}
            </h3>
          </div>

          <div className="flex items-center gap-1">
            {onSelect && (
              <div data-select>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => onSelect(e.target.checked)}
                  className="rounded border-gray-300"
                />
              </div>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild data-dropdown>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDuplicate && (
                  <DropdownMenuItem onClick={onDuplicate}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                )}
                {onShare && (
                  <DropdownMenuItem onClick={onShare}>
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                )}
                {onDownload && (
                  <DropdownMenuItem onClick={onDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onDelete} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Presentation Preview */}
        <div 
          className="w-full h-32 rounded-lg mb-4 flex items-center justify-center text-white relative overflow-hidden"
          style={{ 
            background: `linear-gradient(135deg, ${(theme as any).colors.primary}, ${(theme as any).colors.secondary})`
          }}
        >
          <Presentation className="h-12 w-12 opacity-80" />
          <div className="absolute bottom-2 right-2 bg-black/20 rounded px-2 py-1 text-xs">
            {presentation.totalSlides} slides
          </div>
        </div>

        {/* Description */}
        {presentation.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {presentation.description}
          </p>
        )}

        {/* Metadata */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {presentation.estimatedDuration || 15} min
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDistanceToNow(new Date(presentation.updatedAt), { addSuffix: true })}
            </div>
          </div>
          
          {presentation.targetAudience && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span className="truncate">{presentation.targetAudience}</span>
            </div>
          )}
        </div>

        {/* Theme indicator */}
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Theme: {theme.name}
            </div>
            <div className="flex gap-1">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: (theme as any).colors.primary }}
              />
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: (theme as any).colors.secondary }}
              />
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: (theme as any).colors.accent }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PresentationCard;
