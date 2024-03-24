import { TestBed } from "@angular/core/testing";

import { CurrentUserAdapter } from "./current-user-adapter.service";

describe("CurrentUserAdapter", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: CurrentUserAdapter = TestBed.get(CurrentUserAdapter);
    expect(service).toBeTruthy();
  });
});
