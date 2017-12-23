import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoreComponent } from './lore.component';

describe('LoreComponent', () => {
  let component: LoreComponent;
  let fixture: ComponentFixture<LoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
