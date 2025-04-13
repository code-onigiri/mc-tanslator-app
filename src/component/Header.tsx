import Menu from "./Menu";
import SettingsMenu from "./Setting";

export default function Header() {
  return (
    <div className="z-10 flex flex-row bg-base-200 shadow-sm items-center py-2">
      <Menu />
      <div className="px-2 text-xl font-bold text-base-content ">
        MC-Translator-App
      </div>
      <div className="ml-auto">
        <SettingsMenu />
      </div>
    </div>
  );
}
