import { Controller, Get, Response, HttpStatus, Inject } from '@nestjs/common';
import { Logger } from 'winston';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@ApiTags('Health Endpoints')
@Controller('')
export class HealthController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {}

  /********************* */
  /***Users Endpoint***/
  /********************* */
  @ApiOperation({ summary: 'Return "englishtest24 API server is on"' })
  @Get('/')
  async healthCheck(@Response() res) {
    try {
      return res
        .status(HttpStatus.OK)
        .json({ message: 'englishtest24 API server is on' });
    } catch (e) {
      this.logger.error(`ERROR in GET / 
                       ${JSON.stringify(e)}`);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Something went wrong. Please try again!' });
    }
  }
}
