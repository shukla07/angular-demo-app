import { TestBed } from "@angular/core/testing";

import { AnyAdapter } from "./any-adapter.service";

describe("AnyAdapterService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: AnyAdapter = TestBed.get(AnyAdapter);
    expect(service).toBeTruthy();
  });
});
