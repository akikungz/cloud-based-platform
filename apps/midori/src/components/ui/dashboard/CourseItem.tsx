"use client";

interface Staff {
  id: string;
  name: string;
  email: string;
}

export interface CourseItemProps {
  id: string;
  code: string;
  name: string;
  main_staff: Staff;
  assistant_staff_1: Staff | null;
  assistant_staff_2: Staff | null;
  assistant_staff_3: Staff | null;
}

export const CourseItem: React.FC<CourseItemProps> = ({
  id,
  code,
  name,
  main_staff,
  assistant_staff_1,
  assistant_staff_2,
  assistant_staff_3,
}) => {
  return (
    <div className="flex flex-col p-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="text-sm text-gray-500">{code}</p>
      <div className="mt-2">
        <h4 className="text-md font-semibold">Main Staff</h4>
        <p className="text-sm text-gray-500">{main_staff.name}</p>
      </div>
      <div className="mt-2">
        <h4 className="text-md font-semibold">Assistant Staff</h4>
        <p className="text-sm text-gray-500">{assistant_staff_1?.name ?? "-"}</p>
        <p className="text-sm text-gray-500">{assistant_staff_2?.name ?? "-"}</p>
        <p className="text-sm text-gray-500">{assistant_staff_3?.name ?? "-"}</p>
      </div>
    </div>
  );
}

export const CourseItemSkeleton: React.FC = () => {
  return (
    <></>
  );
}

export default CourseItem;
