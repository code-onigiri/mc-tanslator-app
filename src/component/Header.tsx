import Menu from "./Menu";
import SettingsMenu from "./Setting";

export default function Header() {
  return (
    <div className="z-10 flex flex-row bg-base-200 shadow-sm items-center py-1 px-2">
      {/* タイトルロゴ */}
      <div className="px-1 text-sm sm:text-base font-bold text-base-content flex-shrink-0">
        MC-Translator-App
      </div>
      
      {/* メニューバー - タイトルの右側に配置 */}
      <div className="ml-2 flex-shrink-0">
        <Menu />
      </div>
      
      {/* 右側のスペーサーと設定メニュー */}
      <div className="ml-auto">
        <SettingsMenu />
      </div>
    </div>
  );
}
