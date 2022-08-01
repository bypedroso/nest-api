import { CacheModule, Module } from '@nestjs/common';
import { BlockListService } from './blocklist.service';

@Module({
  imports: [CacheModule.register()],
  providers: [BlockListService],
  exports: [BlockListModule, BlockListService, CacheModule],
})
export class BlockListModule {}
