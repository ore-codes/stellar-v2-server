import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { customAlphabet } from 'nanoid';

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

  private async generateUniqueCode(): Promise<string> {
    let uniqueCode: string;
    let collision = true;

    while (collision) {
      uniqueCode = customAlphabet('abcdefghijklmnopqrstuvwxyz', 9)();
      const existingMeeting = await this.prisma.meeting.findUnique({
        where: { code: uniqueCode },
      });

      if (!existingMeeting) collision = false;
    }

    return uniqueCode;
  }
}
