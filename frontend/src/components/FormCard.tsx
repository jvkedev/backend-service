import { ReactNode } from "react";

interface FormCardProps {
  title: string;
  children: ReactNode;
  wide?: boolean;
}

export default function FormCard({ title, children, wide = false }: FormCardProps) {
  return (
    <div className="flex flex-1 items-start justify-center px-4 py-12">
      <div className={`w-full border border-gray-200 rounded-lg p-8 ${wide ? "max-w-2xl" : "max-w-sm"}`}>
        <h1 className="text-xl font-semibold text-gray-900 mb-6">{title}</h1>
        {children}
      </div>
    </div>
  );
}
