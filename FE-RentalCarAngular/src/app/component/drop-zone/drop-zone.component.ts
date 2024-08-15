import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-drop-zone',
  templateUrl: './drop-zone.component.html',
  styleUrls: ['./drop-zone.component.css']
})
export class DropZoneComponent {
  @Input() allowedFileTypes: string[] = [];

  files: File[] = [];
  errorMessage: string | null = null;

  @Output() onFileDropped = new EventEmitter<FileList>();

  handleFileDropped(event: DragEvent): void {
    event.preventDefault();
    const fileList = event.dataTransfer?.files;
    if (fileList) {
      this.handleFileUpload(fileList);
    }
  }

  onFileSelected(event: any): void {
    const fileList: FileList = event.target.files;
    this.handleFileUpload(fileList);
  }

  onFileRemoved(): void {
    this.files = [];
  }

  triggerFileInputClick(event: Event, fileInput: HTMLInputElement): void {
    event.preventDefault();
    fileInput.click();
  }

  isValidFileType(file: File): boolean {
    return this.allowedFileTypes.includes(file.type);
  }

  private handleFileUpload(fileList: FileList): void {
    const validFiles: File[] = [];
    if (fileList.length > 0) {
      const file = fileList[0];
      if (this.isValidFileType(file)) {
        this.files = [file]; // Replace the current files array with the new file
        validFiles.push(file);
        this.errorMessage = null;
      } else {
        this.errorMessage = `File type not allowed. Allowed types: ${this.allowedFileTypes.join(', ')}`;
      }
    }
    this.emitFileList(validFiles);
  }

  private emitFileList(files: File[]): void {
    const dataTransfer = new DataTransfer();
    files.forEach(file => dataTransfer.items.add(file));
    this.onFileDropped.emit(dataTransfer.files);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }
}
