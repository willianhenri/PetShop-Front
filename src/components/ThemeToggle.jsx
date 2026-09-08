import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { getTheme, subscribeTheme, toggleTheme } from "../services/theme";

export default function ThemeToggle() {
  const dark = useSyncExternalStore(subscribeTheme, getTheme) === "dark";
  const label = dark ? "Ativar modo claro" : "Ativar modo escuro";

  return (
    <button
      type="button"
      className="icon-button theme-toggle"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      aria-pressed={dark}
    >
      {dark ? <Sun size={19} /> : <Moon size={19} />}
    </button>
  );
}
