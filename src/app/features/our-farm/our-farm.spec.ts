import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OurFarm } from './our-farm';

describe('OurFarm', () => {
  let component: OurFarm;
  let fixture: ComponentFixture<OurFarm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OurFarm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OurFarm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
