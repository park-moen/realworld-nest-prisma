import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';

@Module({
  imports: [],
  providers: [],
  controllers: [ProfileController],
})
export class ProfileModule {}
