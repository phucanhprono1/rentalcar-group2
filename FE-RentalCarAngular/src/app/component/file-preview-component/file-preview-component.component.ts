import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { DocumentUploadService } from '../../services/document-upload.service';

@Component({
  selector: 'app-file-preview-component',
  templateUrl: './file-preview-component.component.html',
  styleUrls: ['./file-preview-component.component.css']
})
export class FilePreviewComponentComponent implements OnInit, OnChanges {
  @Input() fileData: File[] = [];
  @Output() fileRemoved = new EventEmitter<number>();

  constructor(
    private fileUploadService: DocumentUploadService,
    private cd: ChangeDetectorRef // Inject ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const storedFiles = this.fileUploadService.getFiles();
    if (storedFiles.length > 0) {
      this.fileData = storedFiles;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fileData']) {
      this.fileUploadService.setFiles(this.fileData);
      this.cd.detectChanges(); // Trigger change detection manually
    }
  }

  removeFile(index: number): void {
    this.fileData.splice(index, 1);
    this.fileRemoved.emit(index);
    this.fileUploadService.setFiles(this.fileData);
    this.cd.detectChanges(); // Trigger change detection manually
  }

  getFileUrl(file: File): string {
    return URL.createObjectURL(file);
  }
}
