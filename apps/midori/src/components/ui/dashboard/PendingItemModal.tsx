"use client";
import type { PendingRequestItemProps } from "@midori/contexts/staff/pendingItem";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import MemoryIcon from '@mui/icons-material/Memory';
import SettingsIcon from '@mui/icons-material/Settings';
import StorageIcon from '@mui/icons-material/Storage';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, MenuItem, Stack, TextField, Typography } from "@mui/material";

interface PendingItemModalProps {
  item: PendingRequestItemProps;
  onClose: () => void;
}

const PendingItemModal: React.FC<PendingItemModalProps> = ({ item, onClose }) => {
  return (
    <Dialog open onClose={onClose} fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1} justifyContent="space-between">
          <Typography variant="h6" component="div">
            {item.title}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        {/* General content */}
        <Grid container spacing={2}>
          <Grid size={12}>
            <Typography variant="subtitle1" fontWeight="bold">Description</Typography>
            <Typography variant="body1">{item.description}</Typography>
          </Grid>

          <Grid size={{
            xs: 12,
            sm: 6,
            md: 4,
          }}>
            <Typography variant="subtitle1" fontWeight="bold">Requested By</Typography>
            <Typography variant="body1">{item.requestedBy.name}</Typography>
            <Typography variant="body2" color="textSecondary">{item.requestedBy.email}</Typography>
          </Grid>

          <Grid size={{
            xs: 12,
            sm: 6,
            md: 4,
          }}>
            <Typography variant="subtitle1" fontWeight="bold">Course</Typography>
            <Typography variant="body1">{item.course.code} - {item.course.name}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Specifications editing */}
        <Grid container spacing={2} marginTop={2}>
          <Grid size={{
            xs: 12,
            sm: 6,
            md: 4,
          }}>
            <Typography variant="subtitle1" fontWeight="bold">OS</Typography>
            <TextField
              select
              value={item.spec.os}
              onChange={(e) => {
                // Handle OS change logic here
              }}
              fullWidth
              variant="outlined"
              size="small"
              slotProps={{
                input: {
                  startAdornment: <SettingsIcon className="mr-1 -ml-1" />,
                }
              }}
            >
              <MenuItem value="Ubuntu 20.04 (LXC)">Ubuntu 20.04 (LXC)</MenuItem>
              <MenuItem value="Ubuntu 22.04 (LXC)">Ubuntu 22.04 (LXC)</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{
            xs: 12,
            sm: 6,
            md: 4,
          }}>
            <Typography variant="subtitle1" fontWeight="bold">CPU</Typography>
            <TextField
              variant="outlined"
              size="small"
              fullWidth
              value={item.spec.cpu}
              onChange={(e) => {
                // Handle CPU change logic here
              }}
              type="number"
              slotProps={{
                input: {
                  endAdornment: "vCPUs",
                  startAdornment: <MemoryIcon className="mr-1 -ml-1" />,
                }
              }}
            />
          </Grid>
          <Grid size={{
            xs: 12,
            sm: 6,
            md: 4,
          }}>
            <Typography variant="subtitle1" fontWeight="bold">Memory</Typography>
            <TextField
              variant="outlined"
              size="small"
              fullWidth
              value={item.spec.memory}
              onChange={(e) => {
                // Handle memory change logic here
              }}
              type="number"
              slotProps={{
                input: {
                  endAdornment: "MB",
                  startAdornment: <StorageIcon className="mr-1 -ml-1" />,
                }
              }}
            />
          </Grid>
          <Grid size={{
            xs: 12,
            sm: 6,
            md: 4,
          }}>
            <Typography variant="subtitle1" fontWeight="bold">Storage</Typography>
            <TextField
              variant="outlined"
              size="small"
              fullWidth
              value={item.spec.storage}
              onChange={(e) => {
                // Handle storage change logic here
              }}
              type="number"
              slotProps={{
                input: {
                  endAdornment: "GB",
                  startAdornment: <StorageIcon className="mr-1 -ml-1" />,
                }
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button
          variant="outlined"
          color="error"
          onClick={() => {
            // Handle reject logic here
          }}
          endIcon={<CancelIcon />}
        >
          Reject
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => {
            // Handle approve logic here
          }}
          endIcon={<CheckIcon />}
        >
          Approve
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PendingItemModal;
