"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@midori/components/ui/card";
import { cn } from "@midori/utils/format";

export interface TrendCardProps {
  title: string;
  value: string | number;
  valueSuffix?: string;
  icon: React.ReactNode;
  className?: string;
}

export const TrendCard: React.FC<TrendCardProps> = ({ title, value, icon, className, valueSuffix }) => {
  return (
    <Card className="group hover:shadow-medium transition-all duration-300 hover:scale-[1.02] border-vm-blue-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-vm-blue-700">
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded", className)}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-vm-blue-900 mb-1">
          {value}
        </div>
        <p className="text-xs text-vm-blue-600 mb-2">
          {valueSuffix ? valueSuffix : title}
        </p>
      </CardContent>
    </Card>
  );
};

export default TrendCard;
