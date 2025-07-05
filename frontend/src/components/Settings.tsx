import { Check, Languages, Moon, Settings, SunDim } from "lucide-react";
import { useState } from "react";
import { themeStore } from "../store/store";
import { motion } from "framer-motion";
const SettingsIcon = () => {
  const [menu, setMenu] = useState<boolean>(false);
  const { themeType, setThemeType, lang, setLang } = themeStore();

  function handleThemeToggle(mode: string) {
    setThemeType(mode);
    setMenu(false);
  }

  function handleLanguageChange(lang: string) {
    setLang(lang);
    setMenu(false);
  }

  return (
    <div className="relative">
      {/* toggle button */}
      <button
        onClick={() => setMenu(!menu)}
        className="fixed bottom-5 right-5 bg-blue-200 p-2 rounded-full group hover:bg-transparent border-1 border-transparent  cursor-pointer shadow-sm hover:shadow-blue-400"
      >
        <Settings className="w-4 h-4 text-blue-700 group-hover:rotate-90 ease-in-out duration-200 group-hover:scale-105 " />
      </button>

      {/* Menu */}
      {menu && (
        <motion.div
          initial={{ opacity: 0, translateX: "100px" }}
          animate={{ opacity: 1, translateX: "0px" }}
          transition={{ ease: "easeInOut", duration: 0.2 }}
          className={` ${
            themeType === "light"
              ? "bg-zinc-100"
              : "bg-slate-700 text-slate-200"
          } fixed overflow-hidden text-xs bottom-14 right-11 w-[220px]  rounded-xl shadow-md`}
        >
          <div className="flex items-center justify-between px-3">
            <h2
              className={`${
                themeType === "light" ? "text-zinc-700" : "text-slate-400"
              } font-semibold   py-3 `}
            >
              Language
            </h2>
            <Languages className="size-4" />
          </div>
          <div
            className={`h-0.5 w-full ${
              themeType === "light" ? "bg-zinc-200" : "bg-slate-500"
            } `}
          />

          <div className="p-3 px-4 flex flex-col gap-2">
            <button
              onClick={() => handleLanguageChange("english")}
              className="flex items-center justify-between"
            >
              <span className="cursor-pointer">English</span>
              {lang === "english" && <Check className="size-4" />}
            </button>

            <button
              onClick={() => handleLanguageChange("hindi")}
              className="flex items-center justify-between"
            >
              <span className="cursor-pointer">Hindi</span>
              {lang === "hindi" && <Check className="size-4" />}
            </button>
          </div>

          <div
            className={`h-0.5 w-full ${
              themeType === "light" ? "bg-zinc-200" : "bg-slate-500"
            } `}
          />
          <div className="flex p-3 items-center justify-center  s">
            <button
              onClick={() => handleThemeToggle("light")}
              className={`w-1/2  ${
                themeType === "light" && "bg-blue-500"
              }  py-1 rounded-md flex items-center gap-1 justify-center`}
            >
              <SunDim className="w-4 h-4" /> Light
            </button>
            <button
              onClick={() => handleThemeToggle("dark")}
              className={`w-1/2 py-1 rounded-md 
                ${themeType === "dark" && "bg-blue-500"}
                flex items-center gap-1 justify-center`}
            >
              <Moon className="w-4 h-4" /> Dark
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SettingsIcon;
