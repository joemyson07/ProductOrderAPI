import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManguitosComponent } from './manguitos.component';

describe('ManguitosComponent', () => {
  let component: ManguitosComponent;
  let fixture: ComponentFixture<ManguitosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManguitosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManguitosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
