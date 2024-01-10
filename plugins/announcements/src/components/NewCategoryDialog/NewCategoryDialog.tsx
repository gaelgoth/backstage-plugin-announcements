import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  ListItemIcon,
  ListItemAvatar,
  Avatar,
} from '@material-ui/core';
import ErrorIcon from '@material-ui/icons/Error';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { announcementsApiRef } from '../../api';

export type NewCategoryDialogProps = {
  open: boolean;
  onClose: () => any;
};

export const NewCategoryDialog = (props: NewCategoryDialogProps) => {
  const announcementsApi = useApi(announcementsApiRef);
  const alertApi = useApi(alertApiRef);

  const [title, setTitle] = React.useState('');
  const [selectedOption, setSelectedOption] = React.useState(''); // State for selected option

  const onClose = () => {
    props.onClose();
  };

  const onConfirm = async () => {
    try {
      await announcementsApi.createCategory({
        title,
        // selectedOption, // TODO: Add selected Options here
      });
      alertApi.post({ message: 'Category created.', severity: 'success' });
      props.onClose();
    } catch (err) {
      alertApi.post({ message: (err as Error).message, severity: 'error' });
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleSelectChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedOption(event.target.value as string);
  };

  return (
    <Dialog open={props.open} onClose={onClose}>
      <DialogTitle>New category</DialogTitle>

      <DialogContent>
        <TextField
          margin="normal"
          id="title"
          label="Title"
          value={title}
          onChange={handleChange}
          type="text"
          fullWidth
        />
        {/* TODO: Select a predefined list of category icons */}
        <Select
          label="Select a category icon"
          value={selectedOption}
          onChange={handleSelectChange}
          fullWidth
        >
          <MenuItem value="option1">
            <ListItemIcon>
              <ErrorIcon />
            </ListItemIcon>
            Important
          </MenuItem>
          <MenuItem value="option2">
            <ListItemAvatar>
              <Avatar>
                <ErrorIcon />
              </Avatar>
            </ListItemAvatar>{' '}
            Important
          </MenuItem>
          <MenuItem value="option3">Icon 3</MenuItem>
        </Select>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="default">
          Cancel
        </Button>

        <Button onClick={onConfirm} color="primary">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};
