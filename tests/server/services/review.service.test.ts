import { describe, it, expect, vi, beforeEach } from 'vitest';

import ReviewService from '~~/server/services/review.service';

const { mockSendMail } = vi.hoisted(() => ({ mockSendMail: vi.fn() }));

vi.mock('~~/server/services/mailer.service', () => ({
  mailer: { sendMail: mockSendMail }
}));

beforeEach(() => vi.clearAllMocks());

describe('ReviewService.handleReview', () => {
  it('sends an email with all review fields', async () => {
    mockSendMail.mockResolvedValue(undefined);
    await ReviewService.handleReview({
      type: 'bug',
      rating: 4,
      categories: ['ui', 'speed'],
      feedback: 'great',
      suggestions: 'improve x',
      email: 'a@b.com'
    });
    expect(mockSendMail).toHaveBeenCalledWith(
      'maximilien.schall@gmail.com',
      'New bug review received',
      expect.stringContaining('Rating: 4')
    );
    const body = mockSendMail.mock.calls[0][2];
    expect(body).toContain('Categories: ui, speed');
    expect(body).toContain('Feedback: great');
    expect(body).toContain('Suggestions: improve x');
    expect(body).toContain('Email: a@b.com');
  });

  it('uses N/A when suggestions and email are missing', async () => {
    mockSendMail.mockResolvedValue(undefined);
    await ReviewService.handleReview({
      type: 'feature', rating: 5, categories: [], feedback: 'fb'
    });
    const body = mockSendMail.mock.calls[0][2];
    expect(body).toContain('Suggestions: N/A');
    expect(body).toContain('Email: N/A');
  });
});
