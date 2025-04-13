import Editer from "../component/Editer";
import Header from "../component/Header";
import SideBar from "../component/SideBar";

function Edit() {
  return (
    <div className="h-screen overflow-hidden">
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
