import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccessToken } from 'livekit-server-sdk';
import { randomBytes } from 'crypto';

@Injectable()
export class MeetingService {
  constructor(private prisma: PrismaService) {}

  async createMeeting(
    userId: string,
    data: { title: string; description?: string },
  ) {
    const meetingCode = await this.generateUniqueCode();

    return this.prisma.meeting.create({
      data: {
        ...data,
        userId,
        code: meetingCode,
        durationInSecs: 0,
      },
    });
  }

  async joinMeeting(userId: string, code: string) {
    const meeting = await this.prisma.meeting.findUnique({ where: { code } });

    if (!meeting) throw new NotFoundException('Meeting not found');

    const livekitToken = new AccessToken('devkey', 'secret', {
      identity: userId,
    });
    livekitToken.addGrant({ roomJoin: true, room: meeting.id });
    const token = await livekitToken.toJwt();

    const participant =
      (await this.prisma.meetingParticipant.findUnique({
        where: {
          userId_meetingId: { userId, meetingId: meeting.id },
        },
      })) ??
      (await this.prisma.meetingParticipant.create({
        data: {
          userId,
          meetingId: meeting.id,
          joinTime: new Date(),
          durationInSecs: 0,
        },
      }));

    return { participant, token };
  }

  private async generateUniqueCode(): Promise<string> {
    let uniqueCode: string;
    let collision = true;

    while (collision) {
      uniqueCode = randomBytes(6).toString('hex').slice(0, 9);
      const existingMeeting = await this.prisma.meeting.findUnique({
        where: { code: uniqueCode },
      });

      if (!existingMeeting) collision = false;
    }

    return uniqueCode;
  }
}
