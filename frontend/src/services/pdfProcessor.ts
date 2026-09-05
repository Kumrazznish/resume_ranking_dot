/**
 * Enhanced PDF Processing Service
 * Uses multiple fallback methods for reliable PDF text extraction
 */

import { API_BASE } from './apiConfig';

export class PDFProcessor {
  private static instance: PDFProcessor;
  
  public static getInstance(): PDFProcessor {
    if (!PDFProcessor.instance) {
      PDFProcessor.instance = new PDFProcessor();
    }
    return PDFProcessor.instance;
  }

  /**
   * Extract text from PDF using multiple fallback methods
   */
  async extractTextFromPDF(file: File): Promise<string> {
    console.log('Starting PDF text extraction for:', file.name);
    
    // Method 1: Try with client-side PDF.js
    try {
      const text = await this.extractWithPDFJS(file);
      if (text && text.trim().length > 30) {
        console.log('PDF.js client extraction successful for:', file.name);
        return text;
      }
    } catch (error) {
      console.warn('PDF.js client extraction failed:', error);
    }

    // Method 2: High-precision Server-Side Node.js pdf-parse Endpoint
    try {
      const text = await this.extractWithServerAPI(file);
      if (text && text.trim().length > 30) {
        console.log('Server-side PDF parsing successful for:', file.name);
        return text;
      }
    } catch (error) {
      console.warn('Server-side PDF parsing failed:', error);
    }

    // Method 3: Try with FileReader and manual stream parsing
    try {
      const text = await this.extractWithFileReader(file);
      if (text && text.trim().length > 30) {
        console.log('FileReader extraction successful for:', file.name);
        return text;
      }
    } catch (error) {
      console.warn('FileReader extraction failed:', error);
    }

    throw new Error(`Unable to extract text from PDF (${file.name}). Please check if the file contains readable text.`);
  }

  /**
   * Method 2: Extract text via Server API (Node.js pdf-parse)
   */
  private async extractWithServerAPI(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const response = await fetch(`${API_BASE}/analysis/parse-file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-File-Name': file.name
      },
      body: arrayBuffer
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data?.text) {
        return data.data.text;
      }
    }
    throw new Error('Server parse API did not return valid text');
  }

  /**
   * Method 1: Extract using PDF.js with proper version handling
   */
  private async extractWithPDFJS(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);
          
          // Dynamic import to handle PDF.js properly
          const pdfjsLib = await this.loadPDFJS();
          
          const loadingTask = pdfjsLib.getDocument({
            data: uint8Array,
            verbosity: 0, // Reduce console output
            standardFontDataUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/standard_fonts/',
            cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/cmaps/',
            cMapPacked: true,
          });

          const pdf = await loadingTask.promise;
          let fullText = '';

          // Extract text from all pages
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            try {
              const page = await pdf.getPage(pageNum);
              const textContent = await page.getTextContent();
              
              // Combine text items with proper spacing
              const pageText = textContent.items
                .map((item: any) => {
                  if (item.str) {
                    return item.str;
                  }
                  return '';
                })
                .join(' ')
                .replace(/\s+/g, ' ')
                .trim();
              
              if (pageText) {
                fullText += pageText + '\n\n';
              }
            } catch (pageError) {
              console.warn(`Error processing page ${pageNum}:`, pageError);
            }
          }

          if (!fullText.trim()) {
            throw new Error('No text content found in PDF');
          }

          resolve(this.cleanExtractedText(fullText));
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read PDF file'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Method 2: Extract using FileReader with binary parsing
   */
  private async extractWithFileReader(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          const text = reader.result as string;
          
          // Simple PDF text extraction using regex patterns
          const textMatches = text.match(/\(([^)]+)\)/g);
          if (textMatches) {
            const extractedText = textMatches
              .map(match => match.slice(1, -1))
              .join(' ')
              .replace(/\\[rn]/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
            
            if (extractedText.length > 50) {
              resolve(this.cleanExtractedText(extractedText));
              return;
            }
          }

          // Try alternative pattern matching
          const streamMatches = text.match(/stream\s*(.*?)\s*endstream/gs);
          if (streamMatches) {
            const streamText = streamMatches
              .map(match => {
                const content = match.replace(/^stream\s*/, '').replace(/\s*endstream$/, '');
                return content.replace(/[^\x20-\x7E]/g, ' ');
              })
              .join(' ')
              .replace(/\s+/g, ' ')
              .trim();
            
            if (streamText.length > 50) {
              resolve(this.cleanExtractedText(streamText));
              return;
            }
          }

          throw new Error('No readable text found using FileReader method');
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('FileReader failed to process PDF'));
      reader.readAsBinaryString(file);
    });
  }

  /**
   * Method 3: Extract using Canvas rendering (for image-based PDFs)
   */
  private async extractWithCanvas(file: File): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const pdfjsLib = await this.loadPDFJS();
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        const loadingTask = pdfjsLib.getDocument({
          data: uint8Array,
          verbosity: 0,
        });

        const pdf = await loadingTask.promise;
        let extractedText = '';

        // Render first few pages to canvas and try OCR-like extraction
        const maxPages = Math.min(pdf.numPages, 3); // Limit to first 3 pages for performance
        
        for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
          try {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.5 });
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d')!;
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
              canvasContext: context,
              viewport: viewport,
            }).promise;

            // Try to extract text from rendered canvas (basic approach)
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const text = this.extractTextFromImageData(imageData);
            
            if (text) {
              extractedText += text + '\n\n';
            }
          } catch (pageError) {
            console.warn(`Canvas rendering failed for page ${pageNum}:`, pageError);
          }
        }

        if (extractedText.trim().length > 50) {
          resolve(this.cleanExtractedText(extractedText));
        } else {
          throw new Error('Canvas extraction did not yield sufficient text');
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Load PDF.js library dynamically
   */
  private async loadPDFJS(): Promise<any> {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      if (pdfjsLib) {
        if (!pdfjsLib.GlobalWorkerOptions?.workerSrc && typeof window !== 'undefined') {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '5.4.54'}/build/pdf.worker.min.mjs`;
        }
        return pdfjsLib;
      }
    } catch (e) {
      console.warn('Direct pdfjs-dist import fallback:', e);
    }

    if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
      return (window as any).pdfjsLib;
    }

    try {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.js';
      
      return new Promise((resolve, reject) => {
        script.onload = () => {
          const pdfjsLib = (window as any).pdfjsLib;
          if (pdfjsLib) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js';
            resolve(pdfjsLib);
          } else {
            reject(new Error('PDF.js failed to load'));
          }
        };
        
        script.onerror = () => reject(new Error('Failed to load PDF.js from CDN'));
        document.head.appendChild(script);
      });
    } catch (error) {
      throw new Error('Unable to load PDF.js library');
    }
  }

  /**
   * Basic text extraction from image data (placeholder for OCR)
   */
  private extractTextFromImageData(imageData: ImageData): string {
    // This is a very basic approach - in a real application, you'd use OCR
    // For now, we'll return empty string as this method is a fallback
    return '';
  }

  /**
   * Clean and normalize extracted text
   */
  private cleanExtractedText(text: string): string {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove excessive line breaks
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      // Remove special characters that might interfere
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
      // Remove PDF artifacts
      .replace(/\(cid:\d+\)/g, '')
      .replace(/<<[^>]*>>/g, '')
      // Normalize quotes
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      // Trim whitespace
      .trim();
  }

  /**
   * Validate PDF file before processing
   */
  validatePDFFile(file: File): { valid: boolean; error?: string } {
    // Check file size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      return { valid: false, error: 'PDF file is too large. Maximum size is 15MB.' };
    }

    // Check minimum file size
    if (file.size < 1024) {
      return { valid: false, error: 'PDF file is too small. Please ensure it contains content.' };
    }

    // Check file type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return { valid: false, error: 'Invalid file type. Please upload a PDF file.' };
    }

    // Check for password protection (basic check)
    return { valid: true };
  }

  /**
   * Get file information
   */
  getFileInfo(file: File) {
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified),
      sizeFormatted: this.formatFileSize(file.size)
    };
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}