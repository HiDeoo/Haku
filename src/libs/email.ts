import { HttpMethod } from 'constants/http'
import { toError } from 'libs/error'

async function sendEmail(templateId: string, templateParams: Record<string, string> = {}) {
  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: HttpMethod.POST,
      body: JSON.stringify({
        accessToken: process.env.EMAIL_JS_ACCESS_TOKEN,
        service_id: process.env.EMAIL_JS_SERVICE_ID,
        template_id: templateId,
        template_params: templateParams,
        user_id: process.env.EMAIL_JS_USER_ID,
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    if (!res.ok) {
      const text = await res.text()

      throw new Error(text)
    }
  } catch (error) {
    throw new Error('Something went wrong while sending an email.', { cause: toError(error) })
  }
}

export function sendLoginEmail(params: { code: string; expiresIn: string; to: string }) {
  return sendEmail(process.env.EMAIL_JS_TEMPLATE_ID_LOGIN, params)
}
