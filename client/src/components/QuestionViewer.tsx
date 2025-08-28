import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { X, ZoomIn, ZoomOut, RotateCcw, Download, ExternalLink } from 'lucide-react';

interface QuestionViewerProps {
  exam: any;
  isOpen: boolean;
  onClose: () => void;
}

export function QuestionViewer({ exam, isOpen, onClose }: QuestionViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleDownload = () => {
    if (exam.questionContent && exam.questionContent.startsWith('data:image')) {
      const link = document.createElement('a');
      link.href = exam.questionContent;
      link.download = `${exam.title}_question.jpg`;
      link.click();
    }
  };

  const handleOpenInNewTab = () => {
    if (exam.questionSource === 'drive_link') {
      window.open(exam.questionContent, '_blank');
    } else if (exam.questionContent && exam.questionContent.startsWith('data:image')) {
      const newWindow = window.open();
      if (newWindow) {
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
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              🔍 {exam.title} - Question Paper
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                data-testid="button-zoom-out"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-mono bg-white px-2 py-1 rounded border">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                data-testid="button-zoom-in"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRotate}
                data-testid="button-rotate"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                data-testid="button-reset-view"
              >
                Reset
              </Button>
              {exam.questionContent && exam.questionContent.startsWith('data:image') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  data-testid="button-download"
                >
                  <Download className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInNewTab}
                data-testid="button-open-new-tab"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
              <DialogClose asChild>
                <Button variant="outline" size="sm">
                  <X className="w-4 h-4" />
                </Button>
              </DialogClose>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-gray-100">
          {exam.questionSource === 'drive_link' ? (
            <div className="p-8 text-center">
              <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
                <div className="text-6xl mb-4">📎</div>
                <h3 className="text-lg font-semibold mb-2">Google Drive Document</h3>
                <p className="text-gray-600 mb-4">Click below to open the question paper in Google Drive</p>
                <Button 
                  onClick={() => window.open(exam.questionContent, '_blank')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in Google Drive
                </Button>
              </div>
            </div>
          ) : exam.questionContent && exam.questionContent.startsWith('data:image') ? (
            <div className="flex justify-center items-center min-h-full p-4">
              <div 
                className="transition-all duration-300 ease-in-out"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center'
                }}
              >
                <img
                  src={exam.questionContent}
                  alt={`${exam.title} - Question Paper`}
                  className="max-w-full h-auto shadow-lg rounded-lg bg-white"
                  style={{ maxHeight: '80vh' }}
                  data-testid="question-image"
                  onLoad={() => {
                    // Image loaded successfully
                  }}
                  onError={(e) => {
                    console.error('Failed to load question image:', e);
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
                <div className="text-6xl mb-4">❌</div>
                <h3 className="text-lg font-semibold mb-2">No Question Content</h3>
                <p className="text-gray-600">No question paper has been uploaded for this exam.</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>📚 Subject: <strong>{exam.subject === 'chemistry' ? 'Chemistry' : 'ICT'}</strong></span>
              <span>⏱️ Duration: <strong>{exam.duration} minutes</strong></span>
              <span>📊 Total Marks: <strong>{exam.totalMarks}</strong></span>
              <span>{exam.examMode === 'online' ? '📱 Online' : '📝 Offline'} Exam</span>
            </div>
            <div>
              <span>📅 Exam Date: <strong>{new Date(exam.examDate).toLocaleDateString()}</strong></span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}