import { useState, useEffect } from "react";
import { isOwlbearReady, getTheme } from "@/lib/owl-bear";
import OBR from "@owlbear-rodeo/sdk";

export function useOwlBearTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (!isOwlbearReady()) return;

    getTheme().then(setTheme);

    const unsubscribe = OBR.theme.onChange((newTheme) => {
      setTheme(newTheme.mode === "DARK" ? "dark" : "light");
    });

    return () => unsubscribe();
  }, []);

  return theme;
}
