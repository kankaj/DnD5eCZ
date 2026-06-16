import OBR from "@owlbear-rodeo/sdk";

let isInitialized = false;

export function initOwlbearSdk(): Promise<boolean> {
  if (isInitialized) return Promise.resolve(true);

  if (!OBR.isAvailable) {
    console.log("Running outside Owlbear Rodeo");
    return Promise.resolve(false);
  }

  return new Promise<boolean>((resolve) => {
    OBR.onReady(() => {
      isInitialized = true;
      resolve(true);
    });
  });
}

export function isOwlbearReady(): boolean {
  return isInitialized;
}

export async function getTheme(): Promise<"light" | "dark"> {
  if (!isInitialized) return "light";
  const theme = await OBR.theme.getTheme();
  return theme.mode === "DARK" ? "dark" : "light";
}
