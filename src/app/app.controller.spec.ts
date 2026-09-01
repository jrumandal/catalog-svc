import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let controller: AppController;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return service info', () => {
      expect(controller.root()).toEqual({
        service: 'catalog-svc',
        status: 'ok',
        graphql: '/graphql',
        docs: '/api-docs',
        health: '/health',
      });
    });
  });
});
