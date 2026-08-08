import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThisWeekend } from './this-weekend';

describe('ThisWeekend', () => {
  let component: ThisWeekend;
  let fixture: ComponentFixture<ThisWeekend>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThisWeekend]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThisWeekend);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
