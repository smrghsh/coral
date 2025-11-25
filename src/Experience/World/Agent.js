import * as THREE from "three";
import Experience from "../Experience.js";
// import { generateText } from "ai";
// import { openai } from "@ai-sdk/openai"; // Ensure OPENAI_API_KEY environment variable is set
export default class Agent {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.apiKey =
      "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";
    // System prompt with dataset context
    this.systemPrompt =
      "The user is scientific expert in XR, viewing a small slice of a Gaussian Splat 3D of a coral reef in Indonesia. Do not give any extraneous information or postulate.";
    this.chatHistory = [{ role: "system", content: this.systemPrompt }];
  }

  async identify(image) {
    const question =
      "What species of coral is this? First describe charateristics and color. Then discuss several types of coral species that could be found in indonesia. Finally, make your best guess as to what species this is, and explain why you think so.";

    // Add user message with image to history
    this.chatHistory.push({
      role: "user",
      content: [
        {
          type: "text",
          text: question,
        },
        {
          type: "image_url",
          image_url: {
            url: image, // image is already a data:image/png;base64,... string from canvas.toDataURL()
          },
        },
      ],
    });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: this.chatHistory,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI error:", error);
      return "Error: " + (error.error?.message || "Unknown error");
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    // Add assistant reply to history
    this.chatHistory.push({ role: "assistant", content: reply });

    console.log("Coral identification:", reply);
    return reply;
  }
  async ask(query) {
    // Add user message to history
    this.chatHistory.push({ role: "user", content: query });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: this.chatHistory,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI error:", error);
      return "Error: " + (error.error?.message || "Unknown error");
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;
    // Add assistant reply to history
    this.chatHistory.push({ role: "assistant", content: reply });
    return reply;
  }
}
