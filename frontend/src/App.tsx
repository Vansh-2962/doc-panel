import { useState } from "react";
import "./App.css";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import doctorVector from "./assets/medicine-concept-illustration.png";
import { Brain, Loader2, Sparkles } from "lucide-react";
import Popup from "./components/Popup";
import SettingsIcon from "./components/Settings";
import { themeStore } from "./store/store";
import { getStreamData } from "./utils/util";

function App() {
  const [complaint, setComplaint] = useState<string>("");
  const [showPopup, setShowPopUp] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<string[]>([]);
  const { themeType, lang } = themeStore();
  async function handleChange(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setLoading(true);
      setData([]);
      const response = await getStreamData({
        complaint,
        language: lang.toLowerCase(),
      });
      if (response instanceof Response) {
        const reader = response?.body?.getReader();
        const decoder = new TextDecoder("utf-8");
        if (!reader) {
          throw new Error("Reader does not exist on response body");
        }
        while (true) {
          const { value, done } = await reader?.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setData((prev: any) => [...prev, chunk]);
        }
      } else {
        console.log("Invalid response", response);
      }
    } catch (error) {
      console.log("Error : ", error);
    } finally {
      setLoading(false);
      setComplaint("");
    }
  }

  return (
    <>
      <main
        className={`w-full relative h-screen grid grid-cols-2 gap-2 bg-gradient-to-b ${
          themeType === "dark" && "from-slate-500 to-slate-600"
        } from-slate-200 to-slate-50`}
      >
        <section
          className={`flex flex-col items-center justify-center duration-300 ease-in-out ${
            themeType === "dark" ? "bg-slate-900 text-white" : "bg-white"
          }  relative`}
        >
          <form
            onSubmit={handleChange}
            className=" w-3/4 rounded-xl p-5  flex items-center justify-center flex-col  shadow-zinc-600"
          >
            <Brain className="text-zinc-600 w-8 h-8" />
            <h2 className="font-semibold mt-4 mb-2">
              What Seems to Be the Problem?
            </h2>
            <p className="text-sm text-center">
              Specify the main symptom or concern that brought the patient in.
            </p>
            <div className="flex my-4 w-full gap-2">
              <input
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                type="text"
                placeholder="Complaint"
                className={`border w-full p-1 rounded-full border-zinc-400 outline-blue-500 px-3 ${
                  themeType === "light"
                    ? "placeholder:text-zinc-700"
                    : "placeholder:text-zinc-200"
                } `}
              />
              <button
                disabled={loading}
                className="bg-blue-500 text-white disabled:bg-zinc-300 disabled:text-zinc-700 px-6 text-nowrap p-2 rounded-full hover:bg-transparent hover:text-blue-600 cursor-pointer duration-300 hover:border-1"
              >
                {loading ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  "Ask AI"
                )}
              </button>
            </div>
          </form>
          <button
            onClick={() => setShowPopUp(!showPopup)}
            className="border-2 p-2 rounded-full animate-pulse bg-gradient-to-b cursor-pointer absolute bottom-3 right-3 border-purple-500"
          >
            <Sparkles className="w-4 h-4 text-purple-800 " />
          </button>
        </section>

        <section
          className={`${
            themeType === "light" ? "bg-white" : "bg-slate-900"
          }  h-screen overflow-hidden  duration-300 flex flex-col relative`}
        >
          {!data || data.length === 0 ? (
            <div className="flex flex-1 items-center justify-center flex-col gap-4 p-4 overflow-auto">
              <img src={doctorVector} alt="doc-placeholder" width={200} />
              <p className="text-zinc-500 text-center">
                Still quiet in here… type a complaint to proceed.
              </p>
            </div>
          ) : (
            <div
              className={`${
                themeType === "light" ? "text-black" : "text-white"
              } flex-1 p-5 text-sm flex flex-col overflow-auto `}
              style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
            >
              <Markdown remarkPlugins={[remarkGfm]}>{data?.join("")}</Markdown>
            </div>
          )}

          {/* language and theme settings button */}
          <SettingsIcon />
        </section>
        {showPopup && (
          <div className="absolute z-10 w-full duration-300 ease-in-out h-full bg-black/80 opacity-100 flex backdrop-blur-xs items-center justify-center">
            <Popup
              complaint={complaint}
              setShowPopUp={setShowPopUp}
              setComplaint={setComplaint}
              setData={setData}
            />
          </div>
        )}
      </main>
    </>
  );
}

export default App;
