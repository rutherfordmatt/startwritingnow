export function getAppUrl(): string {
  if (process.env.PUBLIC_APP_URL) {
    return process.env.PUBLIC_APP_URL.replace(/\/$/, '');
  }
  return 'http://localhost:5000';
}
