"use client";
import { SamesterItem, SamesterItemSkeleton } from "@midori/components/ui/dashboard/SamesterItem";
import { useLoading } from "@midori/contexts/loading";
import { useSamesters } from "@midori/contexts/staff/samester";

export const Samesters = () => {
  const { isLoading } = useLoading();
  const { samesters } = useSamesters();

  if (isLoading) {
    return Array.from({ length: 10 }).map((_, index) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: Using array index as key for skeleton items
      <SamesterItemSkeleton key={index} />
    ))
  }

  return (
    <div className="flex flex-col gap-2 p-4 bg-vm-orange-50 rounded-lg shadow-md min-h-96">
      { samesters.map((item) => <SamesterItem key={item.id} {...item} />) }
    </div>
  );
}
