// Twilio is intentionally not required in this project. If you want to send SMS via Twilio,
// install the `twilio` package and enable it in your environment.

export async function sendSms(_to: string, _body: string): Promise<boolean> {
  console.warn('SMS sending is disabled (no Twilio configured).');
  return false;
}
