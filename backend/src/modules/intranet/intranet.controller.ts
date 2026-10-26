import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IntranetClientService } from './intranet-client.service';

@ApiTags('Intranet')
@Controller('intranet')
export class IntranetController {
  constructor(private readonly intranetClientService: IntranetClientService) {}

  @Post('sincronizar-servicios')
  @ApiOperation({ summary: 'Sincronizar servicios hospitalarios desde la API de la Intranet' })
  sincronizarServicios() {
    return this.intranetClientService.sincronizarServicios();
  }

  @Post('sincronizar-empleados')
  @ApiOperation({ summary: 'Sincronizar directorio de colaboradores activos desde la Intranet' })
  sincronizarEmpleados() {
    return this.intranetClientService.sincronizarEmpleados();
  }
}
