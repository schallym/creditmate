import { describe, it, expect, vi, beforeEach } from 'vitest';

import { mailer } from '~~/server/services/mailer.service';

const { mockSendMail, mockCreateTransport, mockGetItem, mockHbsCompile } = vi.hoisted(() => ({
  mockSendMail: vi.fn(),
  mockCreateTransport: vi.fn(),
  mockGetItem: vi.fn(),
  mockHbsCompile: vi.fn()
}));

vi.mock('nodemailer', () => ({
  default: { createTransport: mockCreateTransport }
}));

vi.mock('handlebars', () => ({
  default: { compile: mockHbsCompile }
}));

(globalThis as unknown as { useStorage: typeof vi.fn }).useStorage = vi.fn(() => ({
  getItem: mockGetItem
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockCreateTransport.mockReturnValue({ sendMail: mockSendMail });
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

describe('mailer.sendMail', () => {
  it('creates transport and sends email with default from', async () => {
    mockSendMail.mockResolvedValue(undefined);
    await mailer.sendMail('to@x.com', 'subj', 'body');
    expect(mockCreateTransport).toHaveBeenCalledWith({
      host: 'smtp.test.com',
      port: 587,
      secure: true,
      auth: { user: 'test', pass: 'test' }
    });
    expect(mockSendMail).toHaveBeenCalledWith({
      from: 'noreply@resend.dev',
      to: 'to@x.com',
      subject: 'subj',
      text: 'body'
    });
  });

  it('uses custom from address when provided', async () => {
    mockSendMail.mockResolvedValue(undefined);
    await mailer.sendMail('to@x.com', 's', 'b', 'from@x.com');
    expect(mockSendMail.mock.calls[0][0].from).toBe('from@x.com');
  });

  it('rethrows on transporter error', async () => {
    mockSendMail.mockRejectedValue(new Error('SMTP fail'));
    await expect(mailer.sendMail('to@x.com', 's', 'b')).rejects.toThrow('SMTP fail');
  });
});

describe('mailer.sendLocalizedTemplatedMail', () => {
  it('compiles template with enriched context and sends html', async () => {
    mockGetItem.mockResolvedValue('<p>{{logoUrl}} - {{resetUrl}}</p>');
    const compiled = vi.fn(() => '<rendered/>');
    mockHbsCompile.mockReturnValue(compiled);
    mockSendMail.mockResolvedValue(undefined);

    await mailer.sendLocalizedTemplatedMail(
      'to@x.com', 'subj', 'fr', 'reset-password', { resetUrl: 'http://link' }
    );

    expect(mockGetItem).toHaveBeenCalledWith('emails/fr/reset-password.hbs');
    expect(mockHbsCompile).toHaveBeenCalledWith('<p>{{logoUrl}} - {{resetUrl}}</p>', {});
    expect(compiled).toHaveBeenCalledWith({
      resetUrl: 'http://link',
      logoUrl: 'http://localhost:3000/img/logo.png'
    });
    expect(mockSendMail).toHaveBeenCalledWith({
      from: 'noreply@resend.dev',
      to: 'to@x.com',
      subject: 'subj',
      html: '<rendered/>'
    });
  });

  it('uses custom from when provided', async () => {
    mockGetItem.mockResolvedValue('tpl');
    mockHbsCompile.mockReturnValue(() => 'r');
    mockSendMail.mockResolvedValue(undefined);
    await mailer.sendLocalizedTemplatedMail('to@x.com', 's', 'en', 't', {}, 'custom@x.com');
    expect(mockSendMail.mock.calls[0][0].from).toBe('custom@x.com');
  });

  it('rethrows on transporter error', async () => {
    mockGetItem.mockResolvedValue('tpl');
    mockHbsCompile.mockReturnValue(() => 'r');
    mockSendMail.mockRejectedValue(new Error('SMTP fail'));
    await expect(
      mailer.sendLocalizedTemplatedMail('to@x.com', 's', 'en', 't', {})
    ).rejects.toThrow('SMTP fail');
  });
});
