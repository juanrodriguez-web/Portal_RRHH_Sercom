import Image from "next/image";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Image
        src="/logo-sercom.png"
        alt="Sercom Soluciones"
        width={200}
        height={80}
        priority
        className="h-auto w-full max-w-[120px]"
      />
    </div>
  );
}
