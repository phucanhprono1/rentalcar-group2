import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilePreviewComponentComponent } from './file-preview-component.component';

describe('FilePreviewComponentComponent', () => {
  let component: FilePreviewComponentComponent;
  let fixture: ComponentFixture<FilePreviewComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FilePreviewComponentComponent]
    });
    fixture = TestBed.createComponent(FilePreviewComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
