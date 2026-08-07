import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('api', () => {
    it('parse should return error when content is empty', () => {
      const result = appController.parse({ content: '' });
      expect(result.records).toEqual([]);
      expect(result.errors).toContain(
        'No se recibió contenido para interpretar.',
      );
    });

    it('print should return ready-for-print status', () => {
      const result = appController.print({
        labels: [],
      });
      expect(result.status).toBe('ready-for-print');
    });
  });
});
