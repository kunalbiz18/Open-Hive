"use client";
import { AiInput } from "@/components/AIChatBox";

type Props = {
  onSubmit: (text: string, imageDataUrl?: string, webSearch?: boolean, multiAgent?: boolean) => void;
  loading: boolean;
};

export default function FixedInputBar({ onSubmit, loading }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 pt-2 pb-[env(safe-area-inset-bottom)] bg-gradient-to-t from-black/70 to-transparent pointer-events-none">
      <div className="max-w-3xl mx-auto px-3 pointer-events-auto">
        <AiInput onSubmit={(text, imageDataUrl, webSearch, multiAgent) => onSubmit(text, imageDataUrl, webSearch, multiAgent)} loading={loading} />
      </div>
    </div>
  );
}
