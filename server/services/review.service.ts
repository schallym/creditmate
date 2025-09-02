import type { PostReviewDto } from '~~/server/dtos';
import { mailer } from '~~/server/services/mailer.service';

class ReviewService {
  async handleReview(data: PostReviewDto): Promise<void> {
    await mailer.sendMail(
      'maximilien.schall@gmail.com',
      `New ${data.type} review received`,
      `Rating: ${data.rating}
      Type: ${data.type}
      Categories: ${data.categories.join(', ')}
      Feedback: ${data.feedback}
      Suggestions: ${data.suggestions || 'N/A'}
      Email: ${data.email || 'N/A'}`
    );
  }
}

export default new ReviewService();
