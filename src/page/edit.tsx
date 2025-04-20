import { Toaster } from "react-hot-toast";
import Editer from "../component/Editer";
import Header from "../component/Header";
import SideBar from "../component/SideBar";

function Edit() {
  return (
    <div className="h-screen overflow-hidden">
      {/* Toasterコンポーネントを右下に配置し、表示時間を短く設定 */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 2000, // 2秒に短縮
          style: {
            background: "var(--fallback-b1, oklch(var(--b1)))",
            color: "var(--fallback-bc, oklch(var(--bc)))",
            border: "1px solid var(--fallback-b3, oklch(var(--b3)))",
          },
          success: {
            iconTheme: {
              primary: "var(--fallback-su, oklch(var(--su)))",
              secondary: "var(--fallback-suc, oklch(var(--suc)))",
            },
          },
          error: {
            iconTheme: {
              primary: "var(--fallback-er, oklch(var(--er)))",
              secondary: "var(--fallback-erc, oklch(var(--erc)))",
            },
          },
        }}
      />

      <header className="h-32px">
        <Header />
      </header>
      <main className="h-[calc(100vh-32px)] flex flex-row">
        <div className="flex-1/4">
          <SideBar />
        </div>
        <div className="flex-3/4">
          <Editer />
        </div>
      </main>
    </div>
  );
}

export default Edit;
