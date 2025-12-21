import {
  List,
  Datagrid,
  TextField,
  Edit,
  SimpleForm,
  SelectInput,
  ReferenceField,
  ReferenceInput,
} from 'react-admin';

const membershipRoleChoices = [
  { id: 'OWNER', name: 'Owner' },
  { id: 'ADMIN', name: 'Admin' },
  { id: 'MEMBER', name: 'Member' },
  { id: 'VIEWER', name: 'Viewer' },
];

export const MembershipList = (props: any) => (
  <List {...props} filter={{ workspaceId: props.filter?.workspaceId }}>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <ReferenceField source="userId" reference="users" label="User">
        <TextField source="email" />
      </ReferenceField>
      <ReferenceField source="workspaceId" reference="workspaces" label="Workspace">
        <TextField source="name" />
      </ReferenceField>
      <TextField source="role" />
    </Datagrid>
  </List>
);

export const MembershipEdit = () => (
  <Edit>
    <SimpleForm>
      <ReferenceInput source="userId" reference="users" />
      <ReferenceInput source="workspaceId" reference="workspaces" />
      <SelectInput source="role" choices={membershipRoleChoices} />
    </SimpleForm>
  </Edit>
);

