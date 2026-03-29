"use client";
import ThemeProvider, { useTheme } from "../context/ThemeContext";

export default function ThemeLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ThemeContent>{children}</ThemeContent>
    </ThemeProvider>
  );
}

function ThemeContent({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return <div className={theme}>{children}</div>;
}
