import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import { InfoCard } from '@backstage/core-components';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import {
  Button,
  CircularProgress,
  ListItemIcon,
  makeStyles,
  MenuItem,
  Select,
  TextField,
} from '@material-ui/core';
import LoopIcon from '@material-ui/icons/Loop';
import BuildIcon from '@material-ui/icons/Build';
import AnnouncementIcon from '@material-ui/icons/Announcement';
import ErrorIcon from '@material-ui/icons/Error';
import WarningIcon from '@material-ui/icons/Warning';
import {
  Announcement,
  announcementsApiRef,
  CreateAnnouncementRequest,
} from '../../api';
import { Autocomplete } from '@material-ui/lab';
import { useAsync } from 'react-use';

const useStyles = makeStyles(theme => ({
  formRoot: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

export type AnnouncementFormProps = {
  initialData: Announcement;
  onSubmit: (data: CreateAnnouncementRequest) => Promise<void>;
};

export const AnnouncementForm = ({
  initialData,
  onSubmit,
}: AnnouncementFormProps) => {
  const classes = useStyles();
  const identityApi = useApi(identityApiRef);
  const [form, setForm] = React.useState({
    ...initialData,
    category: initialData.category?.slug,
    severity: 'info',
  });
  const [selectedOption, setSelectedOption] = React.useState('info');
  const [loading, setLoading] = React.useState(false);

  const announcementsApi = useApi(announcementsApiRef);
  const { value: categories, loading: categoriesLoading } = useAsync(
    () => announcementsApi.categories(),
    [announcementsApi],
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [event.target.id]: event.target.value,
    });
  };

  const handleSelectChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedOption(event.target.value as string);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    event.preventDefault();

    const userIdentity = await identityApi.getBackstageIdentity();
    const createRequest = {
      ...form,
      ...{
        publisher: userIdentity.userEntityRef,
      },
    };

    await onSubmit(createRequest);
    setLoading(false);
  };

  return (
    <InfoCard
      title={initialData.title ? `Edit announcement` : 'New announcement'}
    >
      <form className={classes.formRoot} onSubmit={handleSubmit}>
        <TextField
          id="title"
          type="text"
          label="Title"
          value={form.title}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          required
        />
        <Autocomplete
          fullWidth
          getOptionSelected={(option, value) => option.slug === value.slug}
          getOptionLabel={option => option.title}
          value={initialData.category}
          onChange={(_event, newInputValue) =>
            setForm({ ...form, category: newInputValue?.slug })
          }
          options={categories || []}
          loading={categoriesLoading}
          renderInput={params => (
            <TextField
              {...params}
              id="category"
              label="Category"
              variant="outlined"
              fullWidth
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {categoriesLoading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
        <Select
          value={selectedOption}
          onChange={handleSelectChange}
          labelId="demo-simple-select-placeholder-label-label"
          variant="outlined"
          fullWidth
        >
          <MenuItem value="info">
            <ListItemIcon>
              <AnnouncementIcon />
            </ListItemIcon>
            Info
          </MenuItem>
          <MenuItem value="important">
            <ListItemIcon>
              <ErrorIcon />
            </ListItemIcon>
            Important
          </MenuItem>
          <MenuItem value="critical">
            <ListItemIcon>
              <WarningIcon />
            </ListItemIcon>
            Critical
          </MenuItem>
          <MenuItem value="upgrade">
            <ListItemIcon>
              <LoopIcon />
            </ListItemIcon>
            Upgrade
          </MenuItem>
          <MenuItem value="maintenance">
            <ListItemIcon>
              <BuildIcon />
            </ListItemIcon>
            Maintenance
          </MenuItem>
        </Select>
        <TextField
          id="excerpt"
          type="text"
          label="Excerpt"
          value={form.excerpt}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          required
        />
        <MDEditor
          value={form.body}
          style={{ minHeight: '30rem' }}
          onChange={value => setForm({ ...form, ...{ body: value || '' } })}
        />
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={loading || !form.body}
        >
          Submit
        </Button>
      </form>
    </InfoCard>
  );
};
