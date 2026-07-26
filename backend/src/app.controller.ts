import { Body, Controller, Post } from '@nestjs/common';
import { AppService, ParsedRecord, PreviewLabel } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('parse')
  parse(@Body() body: { content: string }) {
    return this.appService.parseContent(body.content ?? '');
  }

  @Post('preview')
  preview(@Body() body: { records: ParsedRecord[]; template: string; codeType: string; copies: number }) {
    return this.appService.buildPreview(body);
  }

  @Post('print')
  print(@Body() body: { labels: PreviewLabel[] }) {
    return this.appService.preparePrint(body.labels ?? []);
  }
}
