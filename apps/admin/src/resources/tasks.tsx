import {
  List,
  Datagrid,
  TextField,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  SelectInput,
  ReferenceInput,
  ReferenceField,
  DateField,
  Filter,
  SearchInput,
} from 'react-admin';

const taskStatusChoices = [
  { id: 'BACKLOG', name: 'Backlog' },
  { id: 'IN_PROGRESS', name: 'In Progress' },
  { id: 'DONE', name: 'Done' },
];

const taskPriorityChoices = [
  { id: 'LOW', name: 'Low' },
  { id: 'MEDIUM', name: 'Medium' },
  { id: 'HIGH', name: 'High' },
];

const TaskFilters = (props: any) => (
  <Filter {...props}>
    <ReferenceInput source="workspaceId" reference="workspaces" alwaysOn />
    <ReferenceInput source="projectId" reference="projects" />
    <SelectInput source="status" choices={taskStatusChoices} />
    <SelectInput source="priority" choices={taskPriorityChoices} />
    <ReferenceInput source="assigneeId" reference="users" label="Assignee" />
    <SearchInput source="q" alwaysOn />
  </Filter>
);

export const TaskList = () => (
  <List filters={<TaskFilters />}>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <ReferenceField source="workspaceId" reference="workspaces" label="Workspace">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="projectId" reference="projects" label="Project">
        <TextField source="name" />
      </ReferenceField>
      <TextField source="title" />
      <TextField source="status" />
      <TextField source="priority" />
      <ReferenceField source="assigneeId" reference="users" label="Assignee">
        <TextField source="email" />
      </ReferenceField>
      <DateField source="dueDate" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

export const TaskCreate = () => (
  <Create>
    <SimpleForm>
      <ReferenceInput source="workspaceId" reference="workspaces" required />
      <ReferenceInput source="projectId" reference="projects" />
      <TextInput source="title" required />
      <TextInput source="description" multiline />
      <SelectInput source="status" choices={taskStatusChoices} defaultValue="BACKLOG" />
      <SelectInput source="priority" choices={taskPriorityChoices} defaultValue="MEDIUM" />
      <TextInput source="dueDate" type="datetime-local" />
      <ReferenceInput source="assigneeId" reference="users" label="Assignee" />
    </SimpleForm>
  </Create>
);

export const TaskEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="title" />
      <TextInput source="description" multiline />
      <SelectInput source="status" choices={taskStatusChoices} />
      <SelectInput source="priority" choices={taskPriorityChoices} />
      <TextInput source="dueDate" type="datetime-local" />
      <TextInput source="startDate" type="datetime-local" />
      <TextInput source="estimateMinutes" type="number" />
      <ReferenceInput source="assigneeId" reference="users" label="Assignee" />
    </SimpleForm>
  </Edit>
);

