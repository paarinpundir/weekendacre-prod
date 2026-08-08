import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaTeam } from './wa-team';

describe('WaTeam', () => {
  let component: WaTeam;
  let fixture: ComponentFixture<WaTeam>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaTeam]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WaTeam);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
