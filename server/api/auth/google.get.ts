import AuthService from '~~/server/services/auth.service';

export default defineOAuthGoogleEventHandler({
  config: {
    scope: ['email', 'profile']
  },
  async onSuccess(event, { user: googleUser }) {
    const user = await AuthService.findOrCreateOAuthUser({
      email: googleUser.email,
      fullName: googleUser.name,
      provider: 'google'
    });

    await setUserSession(event, {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        authProvider: user.authProvider,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

    return sendRedirect(event, '/loans');
  },
  onError(event, error) {
    console.error('Google OAuth error:', error);
    return sendRedirect(event, '/auth/login?error=oauth');
  }
});
