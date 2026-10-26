import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IntranetClientService } from './intranet-client.service';
import { IntranetController } from './intranet.controller';

@Module({
  imports: [HttpModule],
  controllers: [IntranetController],
  providers: [IntranetClientService],
  exports: [IntranetClientService],
})
export class IntranetModule {}
