import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { X, ZoomIn, ZoomOut, Download, ExternalLink, FileText } from 'lucide-react';

interface MobileQuestionViewerProps {
  exam: any;
  isOpen: boolean;
  onClose: () => void;
}

export function MobileQuestionViewer({ exam, isOpen, onClose }: MobileQuestionViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isGesturing, setIsGesturing] = useState(false);

  // Reset view when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPanX(0);
      setPanY(0);
    }
  }, [isOpen]);

  // Detect if content is PDF or image
  const isPDF = exam.questionContent?.startsWith('data:application/pdf');
  const isImage = exam.questionContent?.startsWith('data:image');
  const isDriveLink = exam.questionSource === 'drive_link';

  // Handle touch gestures for pinch-to-zoom and pan
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length > 1) {
      setIsGesturing(true);
      e.preventDefault();
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && isGesturing) {
      e.preventDefault();
      
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      // Calculate distance between touches for pinch zoom
      const currentDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      // Store initial distance on first gesture
      if (!containerRef.current?.dataset.initialDistance) {
        containerRef.current!.dataset.initialDistance = currentDistance.toString();
        containerRef.current!.dataset.initialZoom = zoom.toString();
      }
      
      const initialDistance = parseFloat(containerRef.current!.dataset.initialDistance!);
      const initialZoom = parseFloat(containerRef.current!.dataset.initialZoom!);
      
      // Calculate new zoom level
      const zoomFactor = currentDistance / initialDistance;
      const newZoom = Math.min(Math.max(initialZoom * zoomFactor, 0.5), 4);
      
      setZoom(newZoom);
    }
  }, [isGesturing, zoom]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      setIsGesturing(false);
      // Clear gesture data
      if (containerRef.current) {
        delete containerRef.current.dataset.initialDistance;
        delete containerRef.current.dataset.initialZoom;
      }
    }
  }, []);

  // Mouse wheel zoom for desktop
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(prev => Math.min(Math.max(prev + delta, 0.5), 4));
    }
  }, []);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  const handleDownload = () => {
    if (exam.questionContent && (isPDF || isImage)) {
      const link = document.createElement('a');
      link.href = exam.questionContent;
      const extension = isPDF ? 'pdf' : 'jpg';
      link.download = `${exam.title}_question.${extension}`;
      link.click();
    }
  };

  const handleOpenInNewTab = () => {
    if (isDriveLink) {
      window.open(exam.questionContent, '_blank');
    } else if (exam.questionContent && (isPDF || isImage)) {
      const newWindow = window.open();
      if (newWindow) {
        if (isPDF) {
          // For PDFs, embed directly
          newWindow.document.write(`
            <html>
              <head><title>${exam.title} - Question Paper</title></head>
              <body style="margin:0; height:100vh;">
                <embed src="${exam.questionContent}" type="application/pdf" width="100%" height="100%" />
              </body>
            </html>
          `);
        } else {
          // For images
          newWindow.document.write(`
            <html>
              <head><title>${exam.title} - Question</title></head>
              <body style="margin:0; background:#000; display:flex; justify-content:center; align-items:center; min-height:100vh;">
                <img src="${exam.questionContent}" style="max-width:100%; max-height:100vh; object-fit:contain;" />
              </body>
            </html>
          `);
        }
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 overflow-hidden">
        <DialogHeader className="p-2 md:p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-sm md:text-lg font-semibold truncate">
              🔍 {exam.title}
            </DialogTitle>
            <div className="flex items-center gap-1 md:gap-2">
              {/* Mobile-optimized controls */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                data-testid="button-zoom-out"
                className="p-1 h-8 w-8 md:h-9 md:w-auto md:px-3"
              >
                <ZoomOut className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
              <span className="text-xs md:text-sm font-mono bg-white px-1 md:px-2 py-1 rounded border min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 4}
                data-testid="button-zoom-in"
                className="p-1 h-8 w-8 md:h-9 md:w-auto md:px-3"
              >
                <ZoomIn className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                data-testid="button-reset-view"
                className="p-1 h-8 w-8 md:h-9 md:w-auto md:px-3"
              >
                <span className="hidden md:inline">Reset</span>
                <span className="md:hidden text-xs">R</span>
              </Button>
              {(isPDF || isImage) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  data-testid="button-download"
                  className="p-1 h-8 w-8 md:h-9 md:w-auto md:px-3"
                >
                  <Download className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInNewTab}
                data-testid="button-open-new-tab"
                className="p-1 h-8 w-8 md:h-9 md:w-auto md:px-3"
              >
                <ExternalLink className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
              <DialogClose asChild>
                <Button variant="outline" size="sm" className="p-1 h-8 w-8 md:h-9 md:w-auto md:px-3">
                  <X className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
              </DialogClose>
            </div>
          </div>
        </DialogHeader>

        <div 
          ref={containerRef}
          className="flex-1 overflow-hidden bg-gray-100 relative touch-pan-x touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          {isDriveLink ? (
            <div className="p-4 md:p-8 text-center h-full flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-md p-4 md:p-8 max-w-sm mx-auto">
                <div className="text-4xl md:text-6xl mb-4">📎</div>
                <h3 className="text-base md:text-lg font-semibold mb-2">Google Drive Document</h3>
                <p className="text-sm md:text-base text-gray-600 mb-4">Click below to open the question paper</p>
                <Button 
                  onClick={() => window.open(exam.questionContent, '_blank')}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm md:text-base"
                >
                  <ExternalLink className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                  Open in Drive
                </Button>
              </div>
            </div>
          ) : isPDF ? (
            <div className="h-full flex items-center justify-center p-2">
              <div 
                ref={contentRef}
                className="transition-transform duration-200 ease-out max-w-full max-h-full"
                style={{
                  transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
                  transformOrigin: 'center center'
                }}
              >
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <embed
                    src={exam.questionContent}
                    type="application/pdf"
                    width="100%"
                    height="600"
                    className="min-w-[300px] md:min-w-[500px]"
                    data-testid="question-pdf"
                  />
                </div>
              </div>
            </div>
          ) : isImage || exam.questionContent?.startsWith('data:image') ? (
            <div className="h-full flex items-center justify-center p-2">
              <div 
                ref={contentRef}
                className="transition-transform duration-200 ease-out"
                style={{
                  transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
                  transformOrigin: 'center center'
                }}
              >
                <img
                  src={exam.questionContent}
                  alt={`${exam.title} - Question Paper`}
                  className="max-w-none shadow-lg rounded-lg bg-white"
                  style={{ 
                    width: 'auto',
                    height: 'auto',
                    maxHeight: zoom <= 1 ? '80vh' : 'none',
                    maxWidth: zoom <= 1 ? '90vw' : 'none'
                  }}
                  data-testid="question-image"
                  onLoad={() => console.log('Question image loaded')}
                  onError={(e) => console.error('Failed to load question image:', e)}
                />
              </div>
            </div>
          ) : (
            <div className="p-4 md:p-8 text-center h-full flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-md p-4 md:p-8 max-w-sm mx-auto">
                <div className="text-4xl md:text-6xl mb-4">❌</div>
                <h3 className="text-base md:text-lg font-semibold mb-2">No Question Content</h3>
                <p className="text-sm md:text-base text-gray-600">No question paper has been uploaded for this exam.</p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile-optimized footer */}
        <div className="p-2 md:p-4 border-t bg-gray-50">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-xs md:text-sm text-gray-600">
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <span>📚 <strong>{exam.subject === 'chemistry' ? 'Chemistry' : 'ICT'}</strong></span>
              <span>⏱️ <strong>{exam.duration}min</strong></span>
              <span>📊 <strong>{exam.totalMarks}</strong></span>
              <span>{exam.examMode === 'online' ? '📱 Online' : '📝 Offline'}</span>
            </div>
            <div className="text-xs md:text-sm">
              <span>📅 <strong>{new Date(exam.examDate).toLocaleDateString()}</strong></span>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500 text-center md:text-left">
            💡 <strong>Mobile:</strong> Pinch to zoom, scroll to pan • <strong>Desktop:</strong> Ctrl+scroll to zoom
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}