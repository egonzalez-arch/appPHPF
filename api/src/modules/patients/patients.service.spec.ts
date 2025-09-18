import { Test } from '@nestjs/testing';
import { PatientsService } from './patients.service';

describe('PatientsService', () => {
  let service: PatientsService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PatientsService,
        { provide: 'PatientRepository', useValue: { find: jest.fn().mockResolvedValue([]) } },
      ],
    }).compile();
    service = module.get(PatientsService);
  });

  it('should list patients', async () => {
    const result = await service.findAll();
    expect(result).toEqual([]);
  });
});