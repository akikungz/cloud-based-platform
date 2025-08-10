"use client";
import { useStaff } from "@midori/contexts/staffList"
import AddIcon from "@mui/icons-material/Add";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, MenuItem, Stack, TextField, Typography } from "@mui/material";

export interface CourseAddProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CourseAdd = ({ isOpen, onClose }: CourseAddProps) => {
  const { staffList } = useStaff();

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1} justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <AddIcon />
            <Typography variant="h6">Add Course</Typography>
          </Stack>

          <IconButton onClick={onClose} color="inherit">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Typography variant="subtitle1">Course Code</Typography>
              <TextField placeholder="Course Code" fullWidth size="small" />
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Typography variant="subtitle1">Course Name</Typography>
              <TextField placeholder="Course Name" fullWidth size="small" />
            </Grid>
          </Grid>

          <Stack direction="column" spacing={1}>
            <Typography variant="subtitle1">Instructor</Typography>
            <TextField label="Instructor" fullWidth size="small" select>
              {staffList.map((staff) => (
                <MenuItem key={staff.id} value={staff.id}>
                  {staff.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <TextField label="Instructor Assistant 1" fullWidth size="small" select>
                {staffList.map((staff) => (
                  <MenuItem key={staff.id} value={staff.id}>
                    {staff.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <TextField label="Instructor Assistant 1" fullWidth size="small" select>
                {staffList.map((staff) => (
                  <MenuItem key={staff.id} value={staff.id}>
                    {staff.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <TextField label="Instructor Assistant 1" fullWidth size="small" select>
                {staffList.map((staff) => (
                  <MenuItem key={staff.id} value={staff.id}>
                    {staff.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="error" startIcon={<CancelIcon />}>
          Cancel
        </Button>
        <Button onClick={onClose} variant="contained" color="primary" startIcon={<AddIcon />}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}