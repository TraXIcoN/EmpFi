import { Loader } from "@/components/Loader";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Loader />
    </div>
  );
}
