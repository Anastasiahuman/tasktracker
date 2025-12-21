import { Admin, Resource } from 'react-admin';
import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';
import CustomLoginPage from './components/Login';
import {
  WorkspaceList,
  WorkspaceShow,
  WorkspaceEdit,
} from './resources/workspaces';
import { UserList, UserShow } from './resources/users';
import { MembershipList, MembershipEdit } from './resources/memberships';
import {
  ProjectList,
  ProjectCreate,
  ProjectEdit,
} from './resources/projects';
import {
  TaskList,
  TaskCreate,
  TaskEdit,
} from './resources/tasks';
import { ActivityList } from './resources/activities';

function App() {
  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      loginPage={CustomLoginPage}
    >
      <Resource
        name="workspaces"
        list={WorkspaceList}
        show={WorkspaceShow}
        edit={WorkspaceEdit}
      />
      <Resource name="users" list={UserList} show={UserShow} />
      <Resource
        name="memberships"
        list={MembershipList}
        edit={MembershipEdit}
      />
      <Resource
        name="projects"
        list={ProjectList}
        create={ProjectCreate}
        edit={ProjectEdit}
      />
      <Resource
        name="tasks"
        list={TaskList}
        create={TaskCreate}
        edit={TaskEdit}
      />
      <Resource name="activities" list={ActivityList} />
    </Admin>
  );
}

export default App;

