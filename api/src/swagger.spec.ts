import { setupSwagger } from './swagger';

describe('Swagger Configuration', () => {
  it('should export setupSwagger function', () => {
    expect(setupSwagger).toBeDefined();
    expect(typeof setupSwagger).toBe('function');
  });

  // Note: More comprehensive testing would require a full NestJS app context
  // For Phase 1, we just verify the function exists and is properly exported
});