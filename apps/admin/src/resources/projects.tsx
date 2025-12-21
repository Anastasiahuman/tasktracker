import {
  List,
  Datagrid,
  TextField,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  ReferenceInput,
  ReferenceField,
} from 'react-admin';

export const ProjectList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <ReferenceField source="workspaceId" reference="workspaces" label="Workspace">
        <TextField source="name" />
      </ReferenceField>
      <TextField source="name" />
      <TextField source="key" />
      <TextField source="description" />
    </Datagrid>
  </List>
);

export const ProjectCreate = () => (
  <Create>
    <SimpleForm>
      <ReferenceInput source="workspaceId" reference="workspaces" />
      <TextInput source="name" required />
      <TextInput source="key" required />
      <TextInput source="description" multiline />
    </SimpleForm>
  </Create>
);

export const ProjectEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="key" />
      <TextInput source="description" multiline />
    </SimpleForm>
  </Edit>
);

