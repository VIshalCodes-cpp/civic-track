import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function generateChatbotResponse(message: string) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: `You are a helpful civic complaint assistant. Your primary purpose is to help users register complaints. You can also have a normal conversation.
Your response must be a JSON object with the following structure: { "response": "<your response>", "intent": "<intent_key>" }.
The 'response' field should contain your text response to the user.
The 'intent' field is optional. If you detect that the user wants to file a complaint, you must set the 'intent' field to one of the following intent keys:
- water_supply_issue
- electricity_issue
- road_damage
- garbage_collection
- sewerage_problem
- public_transport_issue
- noise_complaint
- general

If the user is just having a conversation or asking a general question, do not include the 'intent' field.
Only set the 'intent' when you are confident the user wants to file a complaint.`
      },
      {
        role: "user",
        content: message
      }
    ],
    temperature: 0.7,
  });

  const content = completion.choices[0].message.content;
  if (content) {
    try {
      return JSON.parse(content);
    } catch (e) {
      return { response: content };
    }
  }
  return { response: "I am sorry, I am having trouble understanding. Could you please rephrase?" };
}
