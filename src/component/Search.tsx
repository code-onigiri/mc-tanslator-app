import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useListStore } from "./stores/ListStore";

export function Search() {
  const [isopenchangewindow, setopenchangewindow] = useState(false);
  const changewindows = () => setopenchangewindow(!isopenchangewindow);

  const setquery = useListStore((state) => state.setSearchQuery);
  const query = useListStore((state) => state.searchQuery);

  return (
    <div className="card rounded-md">
      <div className="flex flex-row items-center">
        <label className="m-2 input" style={{ width: "90%" }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setquery(e.target.value)}
          />
        </label>
        <button className="btn btn-square mr-2" onClick={changewindows}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41m-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9" />
            <path
              fillRule="evenodd"
              d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5 5 0 0 0 8 3M3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9z"
            />
          </svg>
        </button>
      </div>
      <AnimatePresence>
        {isopenchangewindow && (
          <motion.div
            className="flex flex-col mb-2" // row から col に変更
            initial={{ opacity: 0, y: -10 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 25,
              },
            }}
            exit={{
              opacity: 0,
              y: -10,
              transition: {
                duration: 0.15,
              },
            }}
          >
            <label className="mx-2 input" style={{ width: "90%" }}>
              <input type="text" placeholder="Replace..." />
            </label>
            <div className="flex justify-end mr-2 mt-2 gap-2">
              {" "}
              {/* ボタン用の右揃えコンテナ */}
              <button className="btn btn-sm">確認置き換え</button>
              <button className="btn btn-sm">一括置き換え</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
