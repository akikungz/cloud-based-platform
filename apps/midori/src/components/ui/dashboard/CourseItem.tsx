"use client";
import { type Staff, useStaff } from "@midori/contexts/staffList";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ResetIcon from "@mui/icons-material/RestartAlt";
import { Button, Grid, MenuItem, Skeleton, Stack, TextField } from "@mui/material";
import { type Dispatch, type SetStateAction, useState } from "react";

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
  // id,
  code,
  name,
  main_staff,
  assistant_staff_1,
  assistant_staff_2,
  assistant_staff_3,
}) => {
  const { staffList } = useStaff();

  const [courseCode, setCourseCode] = useState(code);
  const [courseName, setCourseName] = useState(name);
  const [mainStaff, setMainStaff] = useState(main_staff);
  const [assistant1, setAssistant1] = useState(assistant_staff_1);
  const [assistant2, setAssistant2] = useState(assistant_staff_2);
  const [assistant3, setAssistant3] = useState(assistant_staff_3);

  const handleChangeStaff = (staff_id: string, set: Dispatch<SetStateAction<Staff | null>>) =>
    set(staffList.find((staff) => staff.id === staff_id) || null);

  const handleReset = () => {
    setCourseCode(code);
    setCourseName(name);
    setMainStaff(main_staff);
    setAssistant1(assistant_staff_1);
    setAssistant2(assistant_staff_2);
    setAssistant3(assistant_staff_3);
  };

  return (
    <div className="flex flex-col gap-4 p-4 border-b border-gray-200 bg-white rounded-lg shadow-sm">
      {/* Singleline */}
      <h3 className="text-lg font-semibold text-ellipsis line-clamp-1">{code} - {name}</h3>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <TextField
            fullWidth
            label="Course Code"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <TextField
            fullWidth
            label="Course Name"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            variant="outlined"
            size="small"
          />
        </Grid>
      </Grid>

      <TextField
        fullWidth
        select
        label="Main Staff"
        value={main_staff.id}
        variant="outlined"
        size="small"
        helperText={main_staff.email}
      >
        <MenuItem value="">None</MenuItem>
        {
          staffList.map((staff) => (
            <MenuItem key={staff.id} value={staff.id}>
              {staff.name}
            </MenuItem>
          ))
        }
      </TextField>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <TextField
            fullWidth
            select
            label="Assistant 1"
            value={assistant1 ? assistant1.id : ""}
            onChange={(e) => handleChangeStaff(e.target.value, setAssistant1)}
            variant="outlined"
            size="small"
            helperText={assistant1 ? assistant1.email : "-"}
          >
            <MenuItem value="">None</MenuItem>
            {
              staffList
                .filter((staff) => staff.id !== main_staff.id) // Exclude main staff from assistant options
                .filter((staff) => staff.id !== assistant2?.id) // Exclude already selected assistant
                .filter((staff) => staff.id !== assistant3?.id) // Exclude already selected assistant
                .map((staff) => (
                  <MenuItem key={staff.id} value={staff.id}>
                    {staff.name}
                  </MenuItem>
                ))
            }
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <TextField
            fullWidth
            select
            label="Assistant 2"
            value={assistant2 ? assistant2.id : ""}
            onChange={(e) => handleChangeStaff(e.target.value, setAssistant2)}
            variant="outlined"
            size="small"
            helperText={assistant2 ?
              assistant2.email :
              "-"
            }
          >
            <MenuItem value="">None</MenuItem>
            {
              staffList
                .filter((staff) => staff.id !== main_staff.id) // Exclude main staff from assistant options
                .filter((staff) => staff.id !== assistant1?.id) // Exclude already selected assistant
                .filter((staff) => staff.id !== assistant3?.id) // Exclude already selected assistant
                .map((staff) => (
                  <MenuItem key={staff.id} value={staff.id}>
                    {staff.name}
                  </MenuItem>
                ))
            }
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <TextField
            fullWidth
            select
            label="Assistant 3"
            value={assistant3 ? assistant3.id : ""}
            onChange={(e) => handleChangeStaff(e.target.value, setAssistant3)}
            variant="outlined"
            size="small"
            helperText={assistant3 ?
              assistant3.email :
              "-"
            }
          >
            <MenuItem value="">None</MenuItem>
            {
              staffList
                .filter((staff) => staff.id !== main_staff.id) // Exclude main staff from assistant options
                .filter((staff) => staff.id !== assistant1?.id) // Exclude already selected assistant
                .filter((staff) => staff.id !== assistant2?.id) // Exclude already selected assistant
                .map((staff) => (
                  <MenuItem key={staff.id} value={staff.id}>
                    {staff.name}
                  </MenuItem>
                ))
            }
          </TextField>
        </Grid>
      </Grid>

      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleReset}
          endIcon={<ResetIcon />}
        >
          Reset
        </Button>
        <Button 
          variant="outlined" 
          color="primary"
          endIcon={<EditIcon />}
          disabled={
            // if value is default like props
            mainStaff?.id === main_staff.id &&
            assistant1?.id === assistant_staff_1?.id &&
            assistant2?.id === assistant_staff_2?.id &&
            assistant3?.id === assistant_staff_3?.id &&
            // Course
            code === courseCode &&
            name === courseName
          }
        >
          Edit
        </Button>
        <Button variant="outlined" color="error" endIcon={<DeleteIcon />}>
          Delete
        </Button>
      </Stack>
    </div>
  );
}

export const CourseItemSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 p-4 border-b border-gray-200 bg-white">
      {/* Title Skeleton */}
      <Stack spacing={2} direction="column">
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="text" width="40%" height={20} />
      </Stack>

      {/* Main Staff */}
      <Stack spacing={2} direction="column">
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="text" width="40%" height={20} />
      </Stack>

      {/* Assistant Staff */}
      <Stack spacing={2} direction="column">
        <Skeleton variant="text" width="60%" height={24} />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={20} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={20} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={20} />
          </Grid>
        </Grid>
      </Stack>

      {/* Action */}
      <Stack spacing={2} direction="row" justifyContent="flex-end">
        <Skeleton variant="text" width="20%" height={20} />
        <Skeleton variant="text" width="20%" height={20} />
        <Skeleton variant="text" width="20%" height={20} />
      </Stack>
    </div>
  );
}

export default CourseItem;
