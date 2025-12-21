import { List, Datagrid, TextField, Edit, SimpleForm, TextInput, Show, SimpleShowLayout } from 'react-admin';

export const WorkspaceList = () => (
  <List>
    <Datagrid rowClick="show">
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="slug" />
      <TextField source="description" />
    </Datagrid>
  </List>
);

export const WorkspaceShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="slug" />
      <TextField source="description" />
      <TextField source="createdAt" />
      <TextField source="updatedAt" />
    </SimpleShowLayout>
  </Show>
);

export const WorkspaceEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="slug" />
      <TextInput source="description" multiline />
    </SimpleForm>
  </Edit>
);

