import { List, Datagrid, TextField, Show, SimpleShowLayout } from 'react-admin';

export const UserList = () => (
  <List>
    <Datagrid rowClick="show">
      <TextField source="id" />
      <TextField source="email" />
      <TextField source="name" />
      <TextField source="role" />
    </Datagrid>
  </List>
);

export const UserShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="email" />
      <TextField source="name" />
      <TextField source="role" />
      <TextField source="createdAt" />
      <TextField source="updatedAt" />
    </SimpleShowLayout>
  </Show>
);

