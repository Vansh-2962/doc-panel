import { Brain, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { getStreamData } from "../utils/util";
import { themeStore } from "../store/store";

const Popup = ({
  complaint,
  setShowPopUp,
  setComplaint,
  setData,
}: {
  complaint: string;
  setShowPopUp: (val: boolean) => void;
  setComplaint: (val: string) => void;
  setData: (val: any) => void;
}) => {
  const [side, setSide] = useState("");
  const [bodyPart, setBodyPart] = useState("");
  const [number, setNumber] = useState(0);
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const { lang } = themeStore();

  async function handleChange(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setLoading(true);
      setData([]);
      setShowPopUp(false);
      const response = await getStreamData({
        complaint,
        side,
        number,
        duration,
        bodyPart,
        language: lang,
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
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ ease: "easeInOut", duration: 0.1 }}
      className="w-3/7 bg-white shadow-md shadow-black/40 rounded-3xl p-3 py-4 text-sm flex flex-col gap-5 items-center justify-center"
    >
      <div className="flex flex-col items-center gap-2">
        <Brain className="text-zinc-500 w-8 h-8" />
        <h2 className="font-semibold">Let's get to the root</h2>
        <p className="text-sm text-center text-zinc-500">
          Identify the key symptom or concern to begin the diagnosis.
        </p>
      </div>

      <form className="w-full px-12" onSubmit={handleChange}>
        <label htmlFor="complaint" className="text-sm mb-1 ml-3 font-semibold">
          Complaint
        </label>
        <input
          value={complaint}
          onChange={(e) => setComplaint(e.target.value)}
          type="text"
          id="complaint"
          placeholder="Sharp chest pain when breathing deeply"
          className="border w-full p-1 rounded-full border-zinc-400 outline-blue-500 px-3"
        />

        <div className="my-2">
          <label htmlFor="side" className="text-sm my-5  ml-3 font-semibold">
            Side
          </label>
          <input
            value={side}
            onChange={(e) => setSide(e.target.value)}
            type="text"
            id="side"
            placeholder="Left"
            className="border w-full p-1 rounded-full border-zinc-400 outline-blue-500 px-3"
          />
        </div>

        <div className="my-2">
          <label htmlFor="duration" className="text-sm  ml-3 font-semibold">
            Duration (in months)
          </label>
          <input
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            type="text"
            id="duration"
            placeholder="6 months"
            className="border w-full p-1 rounded-full border-zinc-400 outline-blue-500 px-3"
          />
        </div>

        <div className="my-2">
          <label htmlFor="bodyPart" className="text-sm  ml-3 font-semibold">
            Body part
          </label>
          <input
            value={bodyPart}
            onChange={(e) => setBodyPart(e.target.value)}
            type="text"
            id="duration"
            placeholder="Chest"
            className="border w-full p-1 rounded-full border-zinc-400 outline-blue-500 px-3"
          />
        </div>

        <div className="my-2">
          <label htmlFor="number" className="text-sm ml-3 font-semibold">
            Number of body parts affected
          </label>
          <input
            value={number}
            onChange={(e) => setNumber(parseInt(e.target.value))}
            type="number"
            id="number"
            placeholder="0"
            className="border w-full  p-1 rounded-full border-zinc-400 outline-blue-500 px-3"
          />
        </div>

        <button
          disabled={loading}
          className="bg-blue-500 w-full mt-8 text-white px-6 text-nowrap disabled:bg-zinc-300 disabled:text-zinc-700 p-2 rounded-full hover:bg-transparent hover:text-blue-600 cursor-pointer duration-300 hover:border-1"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="animate-spin w-4 h-4" />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="w-4 h-4 " /> Ask AI
            </div>
          )}
        </button>
        <button
          onClick={() => setShowPopUp(false)}
          className="bg-zinc-200 w-full mt-2 text-zinc-600 px-6 text-nowrap  p-2 rounded-full   cursor-pointer duration-300 "
        >
          Close
        </button>
      </form>
    </motion.div>
  );
};

export default Popup;
