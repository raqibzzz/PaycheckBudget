"use client";

import { FormEvent, useState } from "react";

const ACCESS_PASSWORD = "1107";

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (input === ACCESS_PASSWORD) {
      setUnlocked(true);
      setError("");
      return;
    }
    setError("Wrong password");
  }

  if (!unlocked) {
    return (
      <main className="gate-screen">
        <section className="gate-card">
          <p className="eyebrow">Private Access</p>
          <h1>Raqib&apos;s Budget Tracker</h1>
          <p className="muted">Enter your password to continue.</p>
          <form className="gate-form" onSubmit={onSubmit}>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (error) setError("");
              }}
              placeholder="Password"
            />
            <button className="apply-button" type="submit">
              Unlock
            </button>
          </form>
          {error ? <p className="gate-error">{error}</p> : null}
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
