"use client";

import { SendHorizonal } from "lucide-react";
import { FormEvent, useState } from "react";

import { askMentor } from "@/services/placementos-api";

export function MentorPanel() {
  const [question, setQuestion] = useState("What should I study today?");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim()) {
      return;
    }

    setIsLoading(true);
    const response = await askMentor(question);
    setAnswer(response.answer);
    setIsLoading(false);
  }

  return (
    <form className="mentor-form" onSubmit={onSubmit}>
      <textarea
        aria-label="Ask AI mentor"
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
      />
      <button className="button" disabled={isLoading} type="submit">
        <SendHorizonal size={18} />
        {isLoading ? "Thinking" : "Ask Mentor"}
      </button>
      {answer ? <p className="mentor-answer">{answer}</p> : null}
    </form>
  );
}
