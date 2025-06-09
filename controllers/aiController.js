const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.getAIResponse = async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are Smart Sacco AI, a helpful assistant for SACCO members." },
        { role: "user", content: message }
      ],
      max_tokens: 256,
      temperature: 0.7,
    });

    const aiMessage = completion.choices[0].message.content;
    res.json({ response: aiMessage });
  } catch (error) {
    console.error(error?.message || error);
    res.status(500).json({ error: "Failed to contact OpenAI" });
  }
}; 