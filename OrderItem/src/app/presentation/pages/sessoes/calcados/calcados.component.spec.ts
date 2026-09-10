import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalcadosComponent } from './calcados.component';

describe('CalcadosComponent', () => {
  let component: CalcadosComponent;
  let fixture: ComponentFixture<CalcadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalcadosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CalcadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
