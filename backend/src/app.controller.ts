import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('parse')
  parse(@Body() body: { content: string }) {
    return this.appService.parseContent(body.content ?? '');
  }

  @Post('preview')
  preview(@Body() body: { records: any[]; template: string; codeType: string; copies: number }) {
    return this.appService.buildPreview(body);
  }

  @Post('print')
  print(@Body() body: { labels: any[] }) {
    return this.appService.preparePrint(body.labels ?? []);
  }
}
