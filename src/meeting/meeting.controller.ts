import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MeetingService } from './meeting.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { JoinMeetingDto } from './dto/join-meeting.dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Meetings')
@ApiBearerAuth()
@Controller('meetings')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiResponse({ status: 201, description: 'Meeting successfully created.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  createMeeting(@Req() req: any, @Body() body: CreateMeetingDto) {
    const userId = req.user.userId;
    return this.meetingService.createMeeting(userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('join')
  @ApiResponse({ status: 200, description: 'Successfully joined the meeting.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Meeting not found.' })
  joinMeeting(@Req() req: any, @Body() { code }: JoinMeetingDto) {
    const userId = req.user.userId;
    return this.meetingService.joinMeeting(userId, code);
  }
}
