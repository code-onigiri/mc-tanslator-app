import Menu from "./menu";

export default function Header() {
  return (
    <div className="flex flex-row bg-base-200 items-center">
      <Menu />
      <div className="px-4 py-2 text-xl font-bold text-base-content ">
        MC-Translator-App
      </div>
    </div>
  );
}
