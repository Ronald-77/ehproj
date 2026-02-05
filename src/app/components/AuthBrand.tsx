import { FaFlag } from "react-icons/fa";

export default function AuthBrand() {
  return (
    <div className="flex items-center justify-center gap-2">
      <span className="text-2xl font-extrabold tracking-tight text-white">U</span>

      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
        <FaFlag className="h-5 w-5 text-[#077c8a]" />
      </span>

      <span className="text-2xl font-extrabold tracking-tight text-white">T</span>
    </div>
  );
}
