import { Handler } from '@netlify/functions'

export const handler: Handler = async (event) => {
  try {
    const { prompt } = JSON.parse(event.body || '{}')
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.8,
          max_tokens: 1024
        })
      }
    )
    const data = await response.json()
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    }
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error', details: err.message })
    }
  }
}