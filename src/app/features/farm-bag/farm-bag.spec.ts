import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmBag } from './farm-bag';

describe('FarmBag', () => {
  let component: FarmBag;
  let fixture: ComponentFixture<FarmBag>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FarmBag]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FarmBag);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
