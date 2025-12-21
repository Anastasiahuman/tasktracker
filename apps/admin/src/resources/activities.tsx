import {
  List,
  Datagrid,
  TextField,
  DateField,
  ReferenceField,
  Filter,
  ReferenceInput,
  SelectInput,
} from 'react-admin';

const entityTypeChoices = [
  { id: 'Project', name: 'Project' },
  { id: 'Task', name: 'Task' },
  { id: 'Workspace', name: 'Workspace' },
  { id: 'Membership', name: 'Membership' },
];

const ActivityFilters = (props: any) => (
  <Filter {...props}>
    <ReferenceInput source="workspaceId" reference="workspaces" />
    <SelectInput source="entityType" choices={entityTypeChoices} />
  </Filter>
);

export const ActivityList = () => (
  <List filters={<ActivityFilters />}>
    <Datagrid>
      <TextField source="id" />
      <TextField source="type" />
      <TextField source="content" />
      <ReferenceField source="userId" reference="users" label="User">
        <TextField source="email" />
      </ReferenceField>
      <ReferenceField source="taskId" reference="tasks" label="Task">
        <TextField source="title" />
      </ReferenceField>
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

