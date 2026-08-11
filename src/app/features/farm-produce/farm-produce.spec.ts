import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmProduce } from './farm-produce';

describe('FarmProduce', () => {
  let component: FarmProduce;
  let fixture: ComponentFixture<FarmProduce>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FarmProduce]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FarmProduce);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
