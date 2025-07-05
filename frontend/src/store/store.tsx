import { create } from "zustand";

interface IThemes {
  themeType: string;
  lang: string;
  setLang: (data: string) => void;
  setThemeType: (data: string) => void;
}

export const themeStore = create<IThemes>((set) => ({
  themeType: "light",
  lang: "english",
  setLang: (data: string) => set(()=>({lang:data})),
  setThemeType: (data: string) => set(() => ({ themeType: data })),
}));
