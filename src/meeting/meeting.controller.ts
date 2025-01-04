import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MeetingService } from './meeting.service';

@Controller('meetings')
export class MeetingController {
  constructor(private meetingService: MeetingService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createMeeting(
    @Req() req: any,
    @Body() body: { title: string; description?: string },
  ) {
    const userId = req.user.userId;
    return this.meetingService.createMeeting(userId, body);
  }
}
