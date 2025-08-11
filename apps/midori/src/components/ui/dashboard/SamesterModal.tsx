"use client";
import { useSamesterItem } from "@midori/contexts/staff/samester";
import AddIcon from "@mui/icons-material/Add";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, Stack, TextField, Typography } from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useEffect, useState } from "react";

export interface SamesterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SamesterModal = ({ isOpen, onClose }: SamesterModalProps) => {
  const { samesterItem, setSamesterItem } = useSamesterItem();
  const [startDate, setStartDate] = useState<Date | null>(samesterItem?.start_date || null);
  const [endDate, setEndDate] = useState<Date | null>(samesterItem?.end_date || null);

  const handleClose = () => {
    if (samesterItem) {
      setSamesterItem(null);
      setStartDate(null);
      setEndDate(null);
    } else {
      onClose();
    }
  }

  useEffect(() => {
    if (samesterItem) {
      setStartDate(samesterItem.start_date);
      setEndDate(samesterItem.end_date);
    }
  }, [samesterItem]);

  return (
    <Dialog open={isOpen || !!samesterItem} onClose={handleClose} fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Add Samester</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        {/* Form fields for adding a samester go here */}
        <form className="space-y-4">
          <FormControl fullWidth variant="outlined">
            <Typography variant="subtitle1">Samester</Typography>
            <TextField placeholder="Samester" variant="outlined" size="small" fullWidth name="samester" defaultValue={samesterItem?.name || ''} />
          </FormControl>

          <Stack spacing={2} justifyContent="space-between" direction="row" mt={1}>
            <FormControl fullWidth variant="outlined">
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slotProps={{
                  textField: {
                    size: "small",
                  },
                }}
                name="startDate"
              />
            </FormControl>
            <FormControl fullWidth variant="outlined">
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                slotProps={{
                  textField: {
                    size: "small",
                  },
                }}
                name="endDate"
                minDate={startDate || undefined}
              />
            </FormControl>
          </Stack>
        </form>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={handleClose} startIcon={<CancelIcon />}>Cancel</Button>
        <Button variant="contained" onClick={onClose} startIcon={<AddIcon />}>Add</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SamesterModal;
